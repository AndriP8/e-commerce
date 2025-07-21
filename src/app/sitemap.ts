import { MetadataRoute } from "next";
import { ProductsResponse } from "./types/product-types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for the site
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

  // Static routes
  const staticRoutes = ["", "/login", "/register", "/cart", "/checkout"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: route === "" ? 1.0 : 0.8,
    }),
  );

  // Fetch dynamic product routes
  let productRoutes: {
    url: string;
    lastModified: Date;
    changeFrequency: "weekly";
    priority: number;
  }[] = [];

  try {
    const productsResponse = await fetch(
      `${baseUrl}/api/products?size=1000&in_stock=true`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    );

    if (productsResponse.ok) {
      const products = (await productsResponse.json()) as ProductsResponse;

      productRoutes = products.data.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(product.updated_at || product.created_at),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  return [...staticRoutes, ...productRoutes];
}
