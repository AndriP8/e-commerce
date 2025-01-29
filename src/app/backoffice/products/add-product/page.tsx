import { AddForm } from "./components/add-form";

export default function Page() {
  return (
    <main>
      <h1 className="text-xl">Add Product</h1>
      <div className="rounded-md p-4 w-full h-full">
        <AddForm />
      </div>
    </main>
  );
}
