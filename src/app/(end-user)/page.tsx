import { getQueryClient } from "../get-query-client";
import Categories from "./components/categories";
import FeaturedProducts from "./components/featured-products";
import Footer from "./components/footer";
import Header from "./components/header";
import Hero from "./components/hero";
import { getFeaturedProducts } from "./data/data-fetching";

export default async function Home() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryFn: () => getFeaturedProducts(),
    queryKey: ["featured-products"],
  });
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <Categories />
      </main>
      <Footer />
    </div>
  );
}
