import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/performance.css";
import { Providers } from "./components/Providers";
import Navbar from "./components/Navbar";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
import { WebVitals } from "../components/WebVitals";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "E-Commerce Store - Fast & Reliable Shopping",
  description:
    "High-performance e-commerce platform with optimized loading times and excellent user experience",
  keywords: "e-commerce, shopping, fast loading, performance",
  openGraph: {
    title: "E-Commerce Store",
    description: "High-performance e-commerce platform",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const fetchUser = async (token: string): Promise<{ data: { user: User } } | null> => {
  try {
    if (!token) {
      return null;
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
      headers: {
        Cookie: `token=${token}`,
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
};

const fetchCurrencies = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/currencies`, {
      cache: "force-cache",
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!response.ok) {
      throw new Error("Failed to fetch currencies");
    }
    const currencies = await response.json();
    return currencies;
  } catch (error) {
    console.error("Failed to fetch currencies:", error);
    return [];
  }
};

const fetchUserCurrencyPreference = async (token?: string) => {
  try {
    if (!token) {
      return null;
    }
    console.log("Fetching user currency preference with token:", !token);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/user/currency-preference`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user currency preference");
    }

    const data = await response.json();
    return data.currency;
  } catch (error) {
    console.error("Failed to fetch user currency preference:", error);
    return null;
  }
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const response = await fetchUser(token);
  const currencies = await fetchCurrencies();

  const userCurrency = await fetchUserCurrencyPreference(token);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_CDN_URL} />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_CDN_URL} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <WebVitals />
        <Toaster />
        <Providers
          initialUser={response?.data.user || null}
          initialCurrencies={currencies}
          initialSelectedCurrency={userCurrency || undefined}
        >
          <div className="min-h-screen flex flex-col">
            <Navbar />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
