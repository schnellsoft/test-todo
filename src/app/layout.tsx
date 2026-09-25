import type { Metadata, Viewport } from "next";
import "./globals.css";
import { TodoStoreProvider } from "@/lib/store";
import { RegisterSW } from "@/components/pwa/register-sw";

export const metadata: Metadata = {
  title: "Test Todo",
  description: "An offline-first todo app with categories and subcategories.",
  manifest: "/manifest.webmanifest",
  applicationName: "Test Todo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Test Todo",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#141414",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-dvh bg-background font-sans antialiased">
        <TodoStoreProvider>{children}</TodoStoreProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
