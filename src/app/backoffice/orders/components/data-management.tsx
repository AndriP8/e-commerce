"use client";
import { useQuery } from "@tanstack/react-query";
import { getCookie } from "cookies-next";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTableInfo } from "@/hooks/use-table-info";

import { getOrders, Order } from "../data/data-fetching";
import { OrderTable } from "./order-table";

export function DataManagement() {
  const session = getCookie("session") || "";

  const { pagination, setPagination, setPageData, pageCount, paginationQuery } =
    useTableInfo();

  const { data, isLoading } = useQuery<Order>({
    queryFn: async () => {
      const products = await getOrders({
        ...paginationQuery,
        session,
      });

      if ("data" in products && "pagination" in products) {
        setPageData(products.data, products.pagination.totalPages);
        setPagination({
          pageIndex: products.pagination.page - 1,
          pageSize: products.pagination.size,
        });
      }

      return products;
    },
    queryKey: ["orders", paginationQuery.page],
    enabled: !!session,
  });

  if (!data?.data) return null;
  if (isLoading) return <div className="mx-auto text-center">Loading...</div>;

  return (
    <div className="space-y-4 p-4 w-full h-full">
      <OrderTable orders={data?.data || []} />
      <div className="flex items-center justify-between px-2">
        <div className="flex w-full items-center space-x-6 lg:space-x-8 justify-end">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {pagination.pageIndex + 1} of {pageCount}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =>
                setPagination({ pageIndex: 0, pageSize: pagination.pageSize })
              }
              disabled={!pagination.pageIndex}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setPagination({
                  pageIndex: pagination.pageIndex - 1,
                  pageSize: pagination.pageSize,
                })
              }
              disabled={!pagination.pageIndex}
            >
              <span className="sr-only overflow-auto">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setPagination({
                  pageIndex: pagination.pageIndex + 1,
                  pageSize: pagination.pageSize,
                })
              }
              disabled={pagination.pageIndex === pageCount - 1}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() =>
                setPagination({
                  pageIndex: pageCount - 1,
                  pageSize: pagination.pageSize,
                })
              }
              disabled={pagination.pageIndex === pageCount - 1}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
