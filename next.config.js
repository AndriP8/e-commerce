// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_BUCKET_URL || "",
        port: "",
      },
    ],
    loader: "custom",
    loaderFile: "./image-loader.ts",
  },
};

module.exports = nextConfig;
