"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

import {
  getCategories,
  getProductDetail,
  getSizes,
} from "../data/data-fetching";
import {
  CreateProductBody,
  CreateProductResponse,
  updateProduct,
} from "../data/data-mutation";
import { EditProductSchema, editProductSchema } from "../schema";
import { UploadImageField } from "./upload-image-field";

export function EditForm({ session }: { session: string }) {
  const { id } = useParams<{ id: string }>();

  const { data } = useQuery({
    queryFn: () => getProductDetail({ session, id }),
    queryKey: ["product-detail", id],
  });

  const form = useForm<EditProductSchema>({
    resolver: zodResolver(editProductSchema),
    defaultValues: data?.data,
    values: {
      name: data?.data.name || "",
      category_id: data?.data.category.id || "",
      description: data?.data.description || "",
      sku: data?.data.sku || "",
      price: data?.data.price || 0,
      discount: data?.data.discount || 0,
      variants: data?.data.variants || [],
      images: data?.data.images || [],
    },
  });
  const router = useRouter();

  const variantFields = useFieldArray({
    name: "variants",
    control: form.control,
  });

  const { data: sizes } = useQuery({
    queryFn: () => getSizes(session),
    queryKey: ["sizes"],
  });
  const sizeOptions =
    sizes?.data.map((data) => ({
      label: data.size,
      value: data.id,
    })) || [];

  const { data: categories } = useQuery({
    queryFn: () => getCategories(session),
    queryKey: ["categories"],
  });
  const categoryOptions =
    categories?.data.map((data) => ({
      label: data.name,
      value: data.id,
    })) || [];

  const productMutation = useMutation<
    CreateProductResponse,
    unknown,
    CreateProductBody
  >({
    mutationKey: ["products"],
    mutationFn: (body) => updateProduct({ session, body, params: id }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product created successfully",
        variant: "default",
      });
      router.push("/backoffice/products");
      router.refresh();
    },
  });
  async function onSubmit(values: EditProductSchema) {
    productMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        className="grid grid-cols-1 gap-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                className="p-2 block w-full border-gray-300 rounded-md"
                {...field}
              />
              <FormMessage />
            </div>
          )}
        />
        {/* Category */}
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700"
              >
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                name={field.name}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent id="category">
                  {categoryOptions.map((category) => (
                    <SelectItem value={category.value} key={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </div>
          )}
        />
        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                className="p-2 block w-full border-gray-300 rounded-md"
                {...field}
              />
              <FormMessage />
            </div>
          )}
        />
        {/* SKU */}
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700"
              >
                SKU <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sku"
                type="text"
                className="p-2 block w-full border-gray-300 rounded-md"
                {...field}
              />
              <FormMessage />
            </div>
          )}
        />
        {/* Price */}
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                id="price"
                min={0}
                className="p-2 block w-full border-gray-300 rounded-md"
                {...field}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
              <FormMessage />
            </div>
          )}
        />
        {/* Discount */}
        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="discount"
                className="block text-sm font-medium text-gray-700"
              >
                Discount
              </Label>
              <Input
                type="number"
                id="discount"
                min={0}
                className="p-2 block w-full border-gray-300 rounded-md"
                {...field}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
              <FormMessage />
            </div>
          )}
        />
        {/* Variants */}
        <div className="space-y-2">
          {variantFields.fields.map((fieldItem, index) => (
            <div key={fieldItem.id} className="flex space-x-4">
              {/* Size */}
              <FormField
                control={form.control}
                name={`variants.${index}.size_id`}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="size"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Size <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      name={field.name}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent id="size">
                        {sizeOptions.map((size) => (
                          <SelectItem value={size.value} key={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </div>
                )}
              />
              {/* Stock */}
              <FormField
                control={form.control}
                name={`variants.${index}.stock`}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label
                      htmlFor="stock"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Stock <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      id="stock"
                      min={1}
                      className="p-2 block w-full border-gray-300 rounded-md"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                    <FormMessage />
                  </div>
                )}
              />
              <Button
                variant="destructive"
                className="mt-7"
                onClick={() => variantFields.remove(index)}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
          {form.formState.errors.variants?.root && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.variants.root.message}
            </p>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => variantFields.append({ size_id: "", stock: 0 })}
          >
            Add size
          </Button>
        </div>
        {/* Product images */}
        <UploadImageField session={session} />
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
