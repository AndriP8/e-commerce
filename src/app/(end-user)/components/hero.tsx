import Image from "next/image";

import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] bg-gray-900 text-white">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80"
          alt="Stylish man in a suit walking on a city street"
          className="w-full h-full object-cover object-center"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      </div>
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          Elevate Your Style
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          Discover the latest trends in men&apos;s fashion and redefine your
          wardrobe with our premium collection.
        </p>
        <Button size="lg" className="w-fit">
          Shop Now
        </Button>
      </div>
    </section>
  );
}
