import Header from "../components/header";
import CartInformation from "./components/cart-information";

export default async function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <CartInformation />
      </main>
    </div>
  );
}
