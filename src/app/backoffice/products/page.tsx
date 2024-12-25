import { cookies } from "next/headers";

import { DataManagement } from "./components/data-management";

export default async function Page() {
  const cookiesStore = cookies();
  const session = cookiesStore.get("session")?.value || "";
  return (
    <main>
      <h1 className="text-xl">Products</h1>
      <div className="rounded-md p-4 w-full h-full">
        <DataManagement session={session} />
      </div>
    </main>
  );
}
