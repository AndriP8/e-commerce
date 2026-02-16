import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import "../../styles/performance.css";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Toaster } from "sonner";
import { WebVitals } from "@/app/components/WebVitals";
import { routing } from "@/i18n/routing";
import Navbar from "./components/Navbar";
import { Providers } from "./components/Providers";

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

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

const fetchUser = async (
  token: string,
): Promise<{ data: { user: User } } | null> => {
  try {
    if (!token) {
      return null;
    }
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`,
      {
        headers: {
          Cookie: `token=${token}`,
        },
      },
    );
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/currencies`,
      {
        cache: "force-cache",
        next: { revalidate: 3600 }, // Revalidate every hour
      },
    );
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

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  const response = await fetchUser(token);
  const currencies = await fetchCurrencies();

  const userCurrency = await fetchUserCurrencyPreference(token);

  return (
    <html lang={locale} dir="ltr">
      <body>
        <WebVitals />
        <Toaster />
        <NextIntlClientProvider messages={messages}>
          <Providers
            initialUser={response?.data.user || null}
            initialCurrencies={currencies}
            initialSelectedCurrency={userCurrency || undefined}
          >
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main id="main-content" className="flex-grow" tabIndex={-1}>
                {children}
              </main>
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
