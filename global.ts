import messages from "./messages/en.json";

// Type-safe translations configuration
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages;
  }
}
