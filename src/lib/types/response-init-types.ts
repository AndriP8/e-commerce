import { I18NConfig } from "next/dist/server/config-shared";

export interface NextResponseInit extends globalThis.ResponseInit {
  nextConfig?: {
    basePath?: string;
    i18n?: I18NConfig;
    trailingSlash?: boolean;
  };
  url?: string;
}
