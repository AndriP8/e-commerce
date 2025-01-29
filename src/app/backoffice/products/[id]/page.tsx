import { EditForm } from "./components/edit-form";

export default function Page() {
  return (
    <main>
      <h1 className="text-xl">Edit Product</h1>
      <div className="rounded-md p-4 w-full h-full">
        <EditForm />
      </div>
    </main>
  );
}
