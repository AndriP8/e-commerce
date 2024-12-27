"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2, XCircleIcon } from "lucide-react";
import Image from "next/image";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AddProductSchema, addProductSchema } from "../schema";

const sizes = [
  {
    label: "M",
    value: "79ebc663-481a-49d8-9be6-6708ef39a0bm",
  },
  {
    label: "L",
    value: "79ebc663-481a-49d8-9be6-6708ef39a0bl",
  },
  {
    label: "XL",
    value: "79ebc663-481a-49d8-9be6-6708ef39a0bxl",
  },
];

const categories = [
  {
    label: "Sweaters",
    value: "72fd7d2f-9cc7-48c5-b868-a6526dd4c66sw",
  },
  {
    label: "Jackets",
    value: "72fd7d2f-9cc7-48c5-b868-a6526dd4c66j",
  },
  {
    label: "Shirts",
    value: "72fd7d2f-9cc7-48c5-b868-a6526dd4c66sh",
  },
  {
    label: "T-Shirts",
    value: "72fd7d2f-9cc7-48c5-b868-a6526dd4c66t",
  },
];

export function AddForm() {
  const form = useForm<AddProductSchema>({
    resolver: zodResolver(addProductSchema),
    defaultValues: {
      variants: [{ size_id: "", stock: 1 }],
      price: 0,
      discount: 0,
    },
  });

  const variantFields = useFieldArray({
    name: "variants",
    control: form.control,
  });

  async function onSubmit() {}

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
                  {categories.map((category) => (
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
                        {sizes.map((size) => (
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
        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <div className="space-y-2">
              <Label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Image
              </Label>
              <Input
                type="file"
                ref={field.ref}
                onChange={(e) => {
                  if (!e.target.files) return;
                  field.onChange(e.target.files);
                }}
                accept=".jpg,.png,.webp"
                multiple
                max={4}
              />
              <FormMessage />
              {field.value && (
                <div className="grid grid-cols-2 gap-4">
                  {Array.from(["file"]).map((file, index) => (
                    <div key={file} className="flex gap-2">
                      <Image
                        src={""}
                        alt={`Image preview ${index + 1}`}
                        width={200}
                        height={200}
                        className="size-[200px] object-cover rounded-sm"
                      />
                      <div className="space-y-2 w-full">
                        <p>Filename.jpg</p>
                        <div className="flex gap-2 items-center">
                          <Progress className="w-full" value={50} />
                          <Button
                            variant="ghost"
                            className="size-auto rounded-full p-2"
                          >
                            <XCircleIcon className="size-4 text-gray-700" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        />
        <div>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}
