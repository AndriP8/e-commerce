import { DataManagement } from "./components/data-management";

export default async function Page() {
  return (
    <main>
      <h1 className="text-2xl font-bold">Products</h1>
      <DataManagement />
    </main>
  );
}
