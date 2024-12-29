import { cookies } from "next/headers";

import { AddForm } from "./components/add-form";

export default function Page() {
  const cookiesStore = cookies();
  const session = cookiesStore.get("session")?.value || "";
  return (
    <main>
      <h1 className="text-xl">Add Product</h1>
      <div className="rounded-md p-4 w-full h-full">
        <AddForm session={session} />
      </div>
    </main>
  );
}
