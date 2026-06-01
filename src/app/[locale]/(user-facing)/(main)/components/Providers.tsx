"use client";

import Navbar from "./Navbar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main id="main-content" className="flex-grow" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
