import { cookies } from "next/headers";

import { EditForm } from "./components/edit-form";

export default function Page() {
  const cookiesStore = cookies();
  const session = cookiesStore.get("session")?.value || "";

  return (
    <main>
      <h1 className="text-xl">Edit Product</h1>
      <div className="rounded-md p-4 w-full h-full">
        <EditForm session={session} />
      </div>
    </main>
  );
}
