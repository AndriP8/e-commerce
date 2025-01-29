import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { Dispatch } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Order } from "../data/data-fetching";

type UseColumnArg = {
  setExpandedOrders: Dispatch<string[]>;
  expandedOrders: string[];
};
export const useColumns = ({
  setExpandedOrders,
  expandedOrders,
}: UseColumnArg) => {
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(
      expandedOrders.includes(orderId)
        ? expandedOrders.filter((id) => id !== orderId)
        : [...expandedOrders, orderId],
    );
  };
  const mainColumns: ColumnDef<Order["data"][number]>[] = [
    {
      header: "asd",
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleOrderExpansion(row.original.id)}
          >
            {expandedOrders.includes(row.original.id) ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        );
      },
    },
    {
      header: "Customer",
      accessorKey: "buyer_name",
    },
    {
      header: "Total",
      accessorKey: "total_amount",
    },
    {
      header: "Status",
      accessorKey: "status",
    },
    {
      header: "Create At",
      accessorKey: "created_at",
    },
    {
      header: "asd",
      cell: () => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
              // onSelect={() => handleUpdateStatus(order.id)}
              >
                Update status
              </DropdownMenuItem>
              <DropdownMenuItem>Update receipt</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const expandedColumns: ColumnDef<Order["data"][number]>[] = [
    {
      header: "Item",
      accessorKey: "items.",
    },
  ];
  return { mainColumns, expandedColumns };
};
