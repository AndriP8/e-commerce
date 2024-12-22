import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

import { AppSidebar } from "./sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="p-4 w-full h-auto">
        <SidebarTrigger />
        {children}
      </div>
    </SidebarProvider>
  );
}
