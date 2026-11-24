// Chat widget connection config. Persisted from the integration picker.
// All five values are required; chatType is optional (the core governs runtime type).
export const chatWidgetConfig = {
  chatWidgetId: "6b052ce810f9c20b4d339ce6",
  locationId: "zc3Bl5XnFjfdvCjyyZzE",
  coreUrl: "https://widgets.leadconnectorhq.com/chat-widget-core/core.esm.js",
  marketplaceUrl: "https://services.leadconnectorhq.com",
  source: "ai-studio-native",
  chatType: "liveChat" as const,
};

// Cache the dynamic core import so it loads once per page.
let corePromise: Promise<any> | null = null;
export const loadChatCore = (url: string) => (corePromise ??= import(/* @vite-ignore */ url));
