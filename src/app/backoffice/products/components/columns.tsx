import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/helpers/format-price";

import { Product } from "../data/data-fetching";
import { deleteProduct } from "../data/data-mutation";
export const useColumns = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["products"],
      }),
    onError: (error) =>
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      }),
  });
  const handleDelete = (id: string) => deleteMutation.mutate(id);

  const columns: ColumnDef<Product["data"][number]>[] = [
    {
      header: "Product Name",
      accessorKey: "name",
    },
    {
      header: "Category",
      accessorKey: "category_name",
    },
    {
      header: "sku",
      accessorKey: "sku",
    },
    {
      header: "Sizes",
      cell: ({ row }) => {
        return row.original.variants.map((variant) => variant.size).join(", ");
      },
    },
    {
      header: "Price",
      cell: ({ row }) => {
        const price = row.original.discount
          ? row.original.price -
            (row.original.price * row.original.discount) / 100
          : row.original.price;
        const mainPrice = formatPrice(price);
        const originalPrice = formatPrice(row.original.price);
        return (
          <div>
            <p>{mainPrice}</p>
            {row.original.discount ? (
              <div className="flex space-x-2">
                <p className="text-red-500">{row.original.discount}%</p>
                <p className="line-through">{originalPrice}</p>
              </div>
            ) : null}
          </div>
        );
      },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link href={`/backoffice/products/${row.original.id}`}>
                <Pencil />
              </Link>
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 />
            </Button>
          </div>
        );
      },
    },
  ];
  return columns;
};
