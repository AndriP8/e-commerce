import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | E-Commerce Store",
  description:
    "Sign in to your account to access your orders, wishlist, and more",
  keywords: "login, sign in, account, e-commerce",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
