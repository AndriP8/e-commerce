"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname(); // This pathname is already without locale prefix

  const switchLocale = (newLocale: string) => {
    // Use next-intl's router which handles locale prefixes correctly
    // pathname from next-intl's usePathname is already without locale prefix
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="relative inline-block">
      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
      <select
        value={locale}
        onChange={(e) => switchLocale(e.target.value)}
        className="appearance-none border border-gray-300 rounded-md pl-9 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="ar">العربية</option>
      </select>
      <svg
        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}
