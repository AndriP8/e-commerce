import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/performance.css";
import { NuqsAdapter } from "nuqs/adapters/next";
import { AuthProvider } from "../contexts/AuthContext";
import { CurrencyProvider } from "../contexts/CurrencyContext";
import Navbar from "./components/Navbar";
import { Toaster } from "sonner";
import { cookies } from "next/headers";
import { WebVitals } from "../components/WebVitals";
import PerformanceDashboard from "../components/PerformanceDashboard";

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

const fetchUser = async (): Promise<{ data: { user: User } } | null> => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return null;
    }
    const response = await fetch("http://localhost:3001/api/auth/me", {
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const response = await fetchUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.andripurnomo.com" />
        <link rel="dns-prefetch" href="https://cdn.andripurnomo.com" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WebVitals />
        <Toaster />
        <AuthProvider initialUser={response?.data.user || null}>
          <CurrencyProvider>
            <NuqsAdapter>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                {children}
              </div>
            </NuqsAdapter>
          </CurrencyProvider>
        </AuthProvider>
        <PerformanceDashboard />
      </body>
    </html>
  );
}
