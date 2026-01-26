interface JsonLdProps {
  data: Record<string, unknown>;
}

function JsonLdScript({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ProductJsonLdProps {
  product: {
    name: string;
    description?: string | null;
    slug: string;
    base_price: string;
    brand?: string | null;
    sku?: string | null;
    images?: { image_url: string }[] | null;
    category?: { name: string } | null;
    rating?: { average: number; count: number } | null;
    stock?: { total_quantity: number } | null;
  };
  currencyCode: string;
  baseUrl: string;
}

export function ProductJsonLd({ product, currencyCode, baseUrl }: ProductJsonLdProps) {
  const imageUrl =
    product.images && product.images.length > 0 ? product.images[0].image_url : null;

  const availability =
    product.stock && product.stock.total_quantity > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    url: `${baseUrl}/products/${product.slug}`,
    ...(imageUrl && { image: imageUrl }),
    ...(product.brand && { brand: { "@type": "Brand", name: product.brand } }),
    ...(product.sku && { sku: product.sku }),
    ...(product.category && { category: product.category.name }),
    offers: {
      "@type": "Offer",
      price: parseFloat(product.base_price).toFixed(2),
      priceCurrency: currencyCode,
      availability,
      url: `${baseUrl}/products/${product.slug}`,
    },
  };

  if (product.rating && product.rating.count > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.rating.average.toFixed(1),
      reviewCount: product.rating.count,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return <JsonLdScript data={data} />;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({
  items,
  baseUrl,
}: {
  items: BreadcrumbItem[];
  baseUrl: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${baseUrl}${item.url}`,
    })),
  };

  return <JsonLdScript data={data} />;
}
