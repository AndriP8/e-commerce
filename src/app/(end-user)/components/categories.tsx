import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    id: 1,
    name: "Shirts",
    image:
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTR8fHNoaXJ0c3xlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: 2,
    name: "Casual Wear",
    image:
      "https://images.unsplash.com/photo-1578932750355-5eb30ece487a?q=80&w=2835&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    name: "Outers",
    image:
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function Categories() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link key={category.id} href="#" className="group">
              <div className="relative h-80 overflow-hidden rounded-lg">
                <Image
                  src={category.image}
                  alt={`${category.name} category`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  width={1000}
                  height={800}
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
