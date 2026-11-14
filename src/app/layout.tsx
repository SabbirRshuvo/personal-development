import type { Metadata, Viewport } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { AppShell } from "@/components/layout/AppShell";

const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "আমার ডিসিপ্লিন | প্রতিদিনের কাজ, ইবাদত ও উন্নতির হিসাব",
  description: "একটি আধুনিক, প্রোডাকশন-কোয়ালিটি বাংলা ব্যক্তিগত প্রডাক্টিভিটি ও ডিসিপ্লিন ওয়েব অ্যাপ্লিকেশন।",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "আমার ডিসিপ্লিন",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={hindSiliguri.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192.svg" type="image/svg+xml" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-screen bg-[#faf9f6] dark:bg-[#121110] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
        <ThemeProvider>
          <DataProvider>
            <ServiceWorkerRegister />
            <AppShell>{children}</AppShell>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
