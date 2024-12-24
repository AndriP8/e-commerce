import { DataManagement } from "./components/data-management";

export default async function Page() {
  return (
    <main className="">
      <h1 className="text-xl">Products</h1>
      <div className="rounded-md p-4 w-full h-full">
        <DataManagement />
      </div>
    </main>
  );
}
