"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";
import { Fragment, useState } from "react";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { orderStatus } from "@/lib/enums/order-status";
import { formatPrice } from "@/lib/helpers/format-price";
import { ordersSchema } from "@/lib/schema/orders.schema";

import {
  updateOrder,
  UpdateOrderBody,
  UpdateOrderResponse,
} from "../data/data-mutation";
import { UpdateReceiptModal } from "./update-receipt-modal";
import { UpdateStatusModal } from "./update-status-modal";

type OrderData = z.infer<typeof ordersSchema.read.response.shape.data>;
type OrderTableProps = {
  orders: OrderData;
};

export const OrderTable = ({ orders }: OrderTableProps) => {
  const queryClient = useQueryClient();

  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isUpdateReceiptModalOpen, setIsUpdateReceiptModalOpen] =
    useState(false);
  const [selectedOrder, setSelectedOrder] = useState<(typeof orders)[0] | null>(
    null,
  );

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId],
    );
  };

  const getStatusColor = (status: (typeof orderStatus)[number]) => {
    switch (status) {
      case "pending":
        return "bg-gray-500";
      case "confirmed":
        return "bg-yellow-500";
      case "processing":
        return "bg-green-500";
      case "shipment":
        return "bg-blue-500";
      case "delivered":
        return "bg-green-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleUpdateStatus = (orderId: string) => {
    const orderToUpdate = orders.find((order) => order.id === orderId);
    if (orderToUpdate) {
      setSelectedOrder(orderToUpdate);
      setIsUpdateStatusModalOpen(true);
    }
  };

  const handleUpdateRecipt = (orderId: string) => {
    const orderToUpdate = orders.find((order) => order.id === orderId);
    if (orderToUpdate) {
      setSelectedOrder(orderToUpdate);
      setIsUpdateReceiptModalOpen(true);
    }
  };

  const updateOrderMutation = useMutation<
    UpdateOrderResponse,
    Error,
    UpdateOrderBody
  >({
    mutationFn: (body) =>
      updateOrder({ body, params: selectedOrder?.id || "" }),
    onSuccess: () => {
      setIsUpdateStatusModalOpen(false);
      setIsUpdateReceiptModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Success",
        description: "Edit order successfully",
        variant: "default",
        duration: 3000,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  const updateOrderStatus = (newStatus: (typeof orderStatus)[number]) => {
    updateOrderMutation.mutate({ status: newStatus });
  };
  const updateOrderReceipt = (newReceipt: string) => {
    if (!selectedOrder) return;
    updateOrderMutation.mutate({
      receipt_number: newReceipt,
      status: "shipment",
    });
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <Fragment key={order.id}>
                <TableRow>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleOrderExpansion(order.id)}
                    >
                      {expandedOrders.includes(order.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.id.split("-")[0]}
                  </TableCell>
                  <TableCell>{order.buyer_name}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString("ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(order.total_amount)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onSelect={() => handleUpdateStatus(order.id)}
                        >
                          Update status
                        </DropdownMenuItem>
                        {order.status === "processing" && (
                          <DropdownMenuItem
                            onSelect={() => handleUpdateRecipt(order.id)}
                          >
                            Update receipt
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {expandedOrders.includes(order.id) && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="p-4 bg-gray-50">
                        <h4 className="font-semibold mb-2">Order Items</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Size</TableHead>
                              <TableHead className="text-right">
                                Price
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{item.size}</TableCell>
                                <TableCell className="text-right">
                                  {formatPrice(item.price)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedOrder && (
        <>
          <UpdateStatusModal
            isOpen={isUpdateStatusModalOpen}
            onClose={() => setIsUpdateStatusModalOpen(false)}
            onUpdateStatus={updateOrderStatus}
            currentStatus={selectedOrder.status}
            isSubmitting={updateOrderMutation.isPending}
          />
          <UpdateReceiptModal
            isOpen={isUpdateReceiptModalOpen}
            onClose={() => setIsUpdateReceiptModalOpen(false)}
            onUpdateReceipt={updateOrderReceipt}
            currentReceipt={selectedOrder.receipt_number || ""}
            isSubmitting={false}
          />
        </>
      )}
    </div>
  );
};
