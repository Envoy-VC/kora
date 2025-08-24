import { randomBytes } from "node:crypto";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@kora/ui/components/button";
import { Calendar } from "@kora/ui/components/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@kora/ui/components/form";
import { Input } from "@kora/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@kora/ui/components/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@kora/ui/components/select";
import { cn } from "@kora/ui/lib/utils";
import { readContract } from "@wagmi/core";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { parseUnits, toHex } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { z } from "zod/v4";

import { api } from "@/convex/_generated/api";
import { Contracts } from "@/data/contracts";
import { useFhevm } from "@/hooks";
import { sleep } from "@/lib/helpers";
import { parseErrorMessage } from "@/lib/helpers/error";
import { buildStrategyHooks } from "@/lib/helpers/strategy";
import { wagmiConfig, waitForTransactionReceipt } from "@/lib/wagmi";

const formSchema = z.object({
  frequency: z.object({
    duration: z
      .number({ message: "Frequency Duration is required" })
      .positive(),
    unit: z.union([
      z.literal("hours"),
      z.literal("days"),
      z.literal("weeks"),
      z.literal("months"),
      z.literal("years"),
    ]),
  }),
  maxBudget: z.number({ message: "Max Budget is required" }).positive(),
  maxPurchaseAmount: z
    .number({ message: "Max Purchase Amount is required" })
    .positive(),
  user: z.string({ message: "User is required" }).refine((v) => {
    return /^0x[a-fA-F0-9]{40}$/.test(v);
  }, "Invalid Ethereum address"),
  validUntil: z.date({ message: "Valid Until is required" }),
});

export type FormResponse = z.infer<typeof formSchema>;

export const CreateStrategyForm = () => {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { createEncryptedUint64 } = useFhevm();
  const createStrategy = useMutation(api.functions.strategy.createStrategy);

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      frequency: {
        unit: "days",
      },
      user: address ?? undefined,
    },
    resolver: zodResolver(formSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (values: FormResponse) => {
    const id = toast.loading("Creating Strategy...");
    try {
      setIsSubmitting(true);
      if (!address) throw new Error("Connect your wallet");
      console.log(values);
      await sleep("1s");
      toast.loading(`Approving Kora Executor...`, { id });
      // 1. Approve Max Tokens
      const toApprove = 2n ** 64n - 1n;
      const encApproveAmount = await createEncryptedUint64(
        toApprove,
        Contracts.eWETH.address,
      );
      if (!encApproveAmount?.handles[0])
        throw new Error("Failed to create encrypted amount");
      const approveHash = await writeContractAsync({
        ...Contracts.eWETH,
        args: [
          Contracts.koraExecutor.address,
          toHex(encApproveAmount.handles[0]),
          toHex(encApproveAmount?.inputProof),
        ],
        functionName: "approve",
      });
      await waitForTransactionReceipt(approveHash);
      const encAmount = await createEncryptedUint64(
        parseUnits(values.maxPurchaseAmount.toString(), 6),
        Contracts.koraExecutor.address,
        "0x9A36a8EDAF9605F7D4dDC72F4D81463fb6f841d8",
      );
      if (!encAmount?.handles[0])
        throw new Error("Failed to create encrypted amount");
      // 3. Build Strategy Hooks
      toast.loading("Building Strategy Hooks...", { id });
      const hooks = await buildStrategyHooks({
        encryptFn: createEncryptedUint64,
        frequency: values.frequency,
        maxBudget: values.maxBudget,
        maxPurchaseAmount: values.maxPurchaseAmount,
        userAddress: address,
        validUntil: values.validUntil,
      });
      toast.loading("Creating Strategy...", { id });
      const salt = toHex(randomBytes(32));
      const strategyId = await readContract(wagmiConfig, {
        ...Contracts.koraExecutor,
        args: [address, salt],
        functionName: "computeStrategyId",
      });

      const createHash = await writeContractAsync({
        ...Contracts.koraExecutor,
        args: [address, hooks, salt],
        functionName: "createStrategy",
      });
      await waitForTransactionReceipt(createHash);
      // Write to DB
      await createStrategy({
        amount: {
          handle: toHex(encAmount.handles[0]),
          inputProof: toHex(encAmount.inputProof),
        },
        hooks: {
          frequency: values.frequency,
          maxBudget: Number(parseUnits(values.maxBudget.toString(), 6)),
          maxPurchaseAmount: Number(
            parseUnits(values.maxPurchaseAmount.toString(), 6),
          ),
          validUntil: values.validUntil.toUTCString(),
        },
        nextRunAt: new Date().toUTCString(),
        salt,
        strategyId,
        userAddress: address,
      });
      toast.success("Strategy created successfully", { id });
    } catch (error) {
      console.log(error);
      const message = parseErrorMessage(error);
      toast.error(message, { id });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="user"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-neutral-300">User Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0x..."
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex flex-row items-center gap-2">
            <FormField
              control={form.control}
              name="maxBudget"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-neutral-300">Max Budget</FormLabel>
                  <FormControl>
                    <Input
                      className="!rounded-xl w-full"
                      placeholder="0.00"
                      type="number"
                      {...field}
                      disabled={isSubmitting}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxPurchaseAmount"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-neutral-300">
                    Max Purchase Amount
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="!rounded-xl w-full"
                      disabled={isSubmitting}
                      placeholder="0.00"
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex w-full flex-row gap-2">
            <div className="flex w-full flex-col">
              <div className="pb-2 text-neutral-300 text-sm">Frequency</div>
              <div className="flex w-full flex-row items-center gap-2">
                <FormField
                  control={form.control}
                  name="frequency.duration"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <Input
                          className="w-full rounded-xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          placeholder="1"
                          type="number"
                          {...field}
                          disabled={isSubmitting}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : parseFloat(e.target.value),
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="frequency.unit"
                  render={({ field }) => (
                    <FormItem>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="rounded-xl"
                            disabled={isSubmitting}
                          >
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="years">Year</SelectItem>
                          <SelectItem value="months">Month</SelectItem>
                          <SelectItem value="weeks">Week</SelectItem>
                          <SelectItem value="days">Day</SelectItem>
                          <SelectItem value="hours">Hour</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className="flex w-full flex-col">
              <div className="pb-2 text-neutral-300 text-sm">Valid Until</div>
              <FormField
                control={form.control}
                name="validUntil"
                render={({ field }) => (
                  <FormItem className="flex w-full flex-col">
                    <Popover>
                      <PopoverTrigger asChild={true} disabled={isSubmitting}>
                        <FormControl>
                          <Button
                            className={cn(
                              "!w-full border border-neutral-800 bg-transparent pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            disabled={isSubmitting}
                            innerCls="flex flex-row items-center gap-2 w-full"
                            variant="secondary"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                          captionLayout="dropdown"
                          disabled={{ before: new Date() }}
                          endMonth={new Date(2050, 0)}
                          mode="single"
                          onSelect={field.onChange}
                          selected={field.value}
                          startMonth={new Date(new Date().getFullYear(), 0)}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Button
            className="!font-medium !text-base mt-5 flex w-full flex-row items-center justify-center gap-2 rounded-xl"
            disabled={isSubmitting}
            type="submit"
            variant="default"
          >
            Create Strategy
          </Button>
        </form>
      </Form>
    </div>
  );
};
