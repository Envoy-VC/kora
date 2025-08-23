import { useState } from "react";

import { Button } from "@kora/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kora/ui/components/table";
import { cn } from "@kora/ui/lib/utils";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronsUpDownIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { formatUnits } from "viem";

import type { Strategy } from "@/convex/types";
import { prettyTimeRemaining } from "@/lib/helpers/date";

export const columns: ColumnDef<Strategy>[] = [
  {
    accessorKey: "strategyId",
    cell: ({ row }) => {
      const strategyId = row.getValue("strategyId") as string;
      const truncated = `${strategyId.slice(0, 8)}...${strategyId.slice(-5)}`;
      return (
        <div className="flex flex-row items-center gap-1 text-neutral-300">
          <div>{truncated}</div>
          <Button
            onClick={async () => {
              await navigator.clipboard.writeText(strategyId);
              toast.success("Copied to clipboard");
            }}
            size="icon"
            variant="link"
          >
            <CopyIcon className="size-4 text-neutral-500" />
          </Button>
        </div>
      );
    },
    header: () => {
      return (
        <div className="flex cursor-pointer flex-row items-center gap-2 text-base text-neutral-300">
          Strategy Id
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.hooks.maxBudget,
    accessorKey: "maxBudget",
    cell: ({ row }) => {
      const maxBudget = BigInt(row.getValue("maxBudget"));
      const parsed = formatUnits(maxBudget, 6);

      return <div className="font-medium text-neutral-300">{parsed} WETH</div>;
    },
    header: ({ column }) => {
      return (
        <button
          className="flex cursor-pointer flex-row items-center gap-2 text-base text-neutral-300"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          type="button"
        >
          Max Budget
          <ChevronsUpDownIcon className="size-5" />
        </button>
      );
    },
  },
  {
    accessorFn: (row) => row.hooks.maxPurchaseAmount,
    accessorKey: "maxPurchaseAmount",
    cell: ({ row }) => {
      const maxPurchaseAmount = BigInt(row.getValue("maxPurchaseAmount"));
      const parsed = formatUnits(maxPurchaseAmount, 6);

      return (
        <div className="text-center font-medium text-neutral-300">
          {parsed} WETH
        </div>
      );
    },
    header: ({ column }) => {
      return (
        <button
          className="flex w-full cursor-pointer flex-row items-center justify-center gap-2 text-base text-neutral-300"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          type="button"
        >
          Amount
          <ChevronsUpDownIcon className="size-5" />
        </button>
      );
    },
  },
  {
    accessorFn: (row) => row.hooks.frequency,
    accessorKey: "frequency",
    cell: ({ row }) => {
      const frequency = row.getValue("frequency") as {
        duration: number;
        unit: "hours" | "days" | "weeks" | "months" | "years";
      };

      return (
        <div className="text-center font-medium text-neutral-300">
          Every {frequency.duration} {frequency.unit.slice(0, -1)}
          {frequency.duration > 1 ? "s" : ""}
        </div>
      );
    },
    header: () => {
      return (
        <div className="flex w-full cursor-pointer flex-row items-center justify-center gap-2 text-base text-neutral-300">
          Frequency
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.nextRunAt,
    accessorKey: "nextRunAt",
    cell: ({ row }) => {
      const nextRunAt = new Date(row.getValue("nextRunAt"));
      const text = prettyTimeRemaining(nextRunAt);

      return (
        <div className="text-center font-medium text-neutral-300">{text}</div>
      );
    },
    header: () => {
      return (
        <div className="flex w-full cursor-pointer flex-row items-center justify-center gap-2 text-base text-neutral-300">
          Next Execution
        </div>
      );
    },
  },
  {
    accessorFn: (row) => row.hooks.validUntil,
    accessorKey: "validUntil",
    cell: ({ row }) => {
      const date = new Date(row.getValue("validUntil"));

      const day = date.getDate();
      const suffix =
        day % 10 === 1 && day !== 11
          ? "st"
          : day % 10 === 2 && day !== 12
            ? "nd"
            : day % 10 === 3 && day !== 13
              ? "rd"
              : "th";

      const month = date.toLocaleString("en-US", { month: "long" });

      const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        hour12: true,
        minute: "2-digit",
      });

      return (
        <div className="text-center font-medium text-neutral-300">{`${day}${suffix} ${month}, ${time}`}</div>
      );
    },
    header: () => {
      return (
        <div className="flex w-full cursor-pointer flex-row items-center justify-center gap-2 text-center text-base text-neutral-300">
          Valid Until
        </div>
      );
    },
  },
];

export const StrategiesTable = ({ strategies }: { strategies: Strategy[] }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    columns,
    data: strategies,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="overflow-hidden rounded-md">
      <Table className="!border-none">
        <TableHeader className="!border-none">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="!p-10 !border-none bg-primary/30 hover:bg-primary/25"
              key={headerGroup.id}
            >
              {headerGroup.headers.map((header, index) => {
                return (
                  <TableHead
                    className={cn(
                      "h-12 px-4 ",
                      index === 0 && "rounded-tl-xl rounded-bl-xl",
                      index === headerGroup.headers.length - 1 &&
                        "rounded-tr-xl rounded-br-xl",
                    )}
                    key={header.id}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                className="border-b border-dashed hover:bg-transparent"
                data-state={row.getIsSelected() && "selected"}
                key={row.id}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="px-4" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell className="h-24 text-center" colSpan={columns.length}>
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
