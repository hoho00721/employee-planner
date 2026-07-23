import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { AgentationGuard } from "@/components/AgentationGuard";
import { HappySeedsWatermark } from "@/components/HappySeedsWatermark";
import { Toaster } from "sonner";
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow user to scale up to 5× for accessibility; Android won't auto-zoom
  // inputs because font-size is clamped at 16px in CSS.
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",   // fills punch-hole / notch on Android
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0D1B3E" },
    { media: "(prefers-color-scheme: light)", color: "#1565C0" },
  ],
};

export const metadata: Metadata = {
  title: "منظم الموظف | Employee Planner",
  description: "مساعد شخصي ذكي لإدارة الحياة المهنية والشخصية للموظف",
  applicationName: "منظم الموظف",
  appleWebApp: {
    capable: true,
    title: "منظم الموظف",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  manifest: "/manifest.json",
  icons: {
    icon:        [{ url: "/app-icon.png", sizes: "512x512", type: "image/png" }],
    apple:       [{ url: "/app-icon.png", sizes: "512x512" }],
    shortcut:    "/app-icon.png",
  },
  openGraph: {
    title:       "منظم الموظف",
    description: "مساعد شخصي ذكي لإدارة الحياة المهنية والشخصية للموظف",
    type:        "website",
    locale:      "ar_DZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* PWA manifest is declared via metadata.manifest above */}

        {/* Android splash / status bar */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0D1B3E" />
        <meta name="msapplication-TileImage" content="/app-icon.png" />

        {/* Capacitor: tells WebView this is an app shell */}
        <meta name="format-detection" content="telephone=no" />

        {process.env.NODE_ENV === "production" && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body className="antialiased">
        {children}

        {/* Service Worker registration — client-only component */}
        <ServiceWorkerRegistrar />

        <Toaster position="top-center" richColors />
        <HappySeedsWatermark />
        <AgentationGuard />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
