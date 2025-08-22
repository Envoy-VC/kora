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
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { z } from "zod/v4";

const formSchema = z
  .object({
    frequency: z.object({
      duration: z.number({ message: "Frequency Duration is required" }).min(0),
      unit: z.union([
        z.literal("days"),
        z.literal("weeks"),
        z.literal("months"),
        z.literal("years"),
      ]),
    }),
    maxBudget: z.number({ message: "Max Budget is required" }).min(0),
    maxPurchaseAmount: z
      .number({ message: "Max Purchase Amount is required" })
      .min(0),
    user: z.string({ message: "User is required" }).refine((v) => {
      return /^0x[a-fA-F0-9]{40}$/.test(v);
    }, "Invalid Ethereum address"),
    validUntil: z.date({ message: "Valid Until is required" }),
  })
  .refine((args) => {
    if (args.maxBudget < args.maxPurchaseAmount) {
      return false;
    }
  });

export type FormResponse = z.infer<typeof formSchema>;

export const CreateStrategyForm = () => {
  const { address } = useAccount();

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      frequency: {
        unit: "days",
      },
      user: address ?? undefined,
    },
    resolver: zodResolver(formSchema),
  });

  const onSubmit = (values: FormResponse) => {
    console.log(values);
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
                  <Input placeholder="0x..." {...field} />
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
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                      placeholder="0.00"
                      {...field}
                      className="!rounded-xl w-full"
                      onChange={(e) => field.onChange(Number(e.target.value))}
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
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
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
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="years">Years</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="weeks">Weeks</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
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
                      <PopoverTrigger asChild={true}>
                        <FormControl>
                          <Button
                            className={cn(
                              "!w-full border border-neutral-800 bg-transparent pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
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
