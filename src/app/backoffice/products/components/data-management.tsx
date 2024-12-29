"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useTableInfo } from "@/hooks/use-table-info";

import { getProducts, Product } from "../data/data-fetching";
import { useColumns } from "./columns";

export function DataManagement({ session }: { session: string }) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query);
  const { pagination, setPagination, setPageData, pageCount, paginationQuery } =
    useTableInfo();

  const { data, isLoading } = useQuery<Product>({
    queryFn: async () => {
      const products = await getProducts({
        ...paginationQuery,
        search: debouncedQuery,
        session,
      });

      if ("data" in products && "pagination" in products) {
        setPageData(products.data, products.pagination.totalPages);
      }

      return products;
    },
    queryKey: ["products", paginationQuery, debouncedQuery],
  });

  const columns = useColumns(session);

  if (!data?.data) return null;
  if (isLoading) return <div className="mx-auto text-center">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Input
          className="max-w-xl"
          placeholder="Search product"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button asChild>
          <Link href="/backoffice/products/add-product">Add Product</Link>
        </Button>
      </div>
      <DataTable
        data={data.data}
        columns={columns}
        pagination={pagination}
        onPaginationChange={setPagination}
        pageCount={pageCount}
      />
    </div>
  );
}
