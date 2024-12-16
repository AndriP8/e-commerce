export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="max-w-sm w-full">{children}</div>
    </main>
  );
}
