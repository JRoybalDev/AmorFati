import './globals.css'
import type { Metadata, Viewport } from "next";
import { Manufacturing_Consent, Pirata_One, Texturina } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { FilterProvider } from "@/context/FilterContext";
import Navbar from "../app/components/Navbar/Navbar";
import MainScrollShell from "@/app/components/MainScrollShell";

const texturina = Texturina({
  subsets: ["latin"],
  variable: "--font-texturina",
  display: "swap",
});

const manufacturingConsent = Manufacturing_Consent({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-manufacturing-consent",
  display: "swap",
  adjustFontFallback: false,
});

const pirataOne = Pirata_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pirata-one",
  display: "swap",
  adjustFontFallback: false,
});

export const viewport: Viewport = {
  themeColor: "#BE5103",
};

export const metadata: Metadata = {
  title: {
    default: "Unearthing Amor Fati",
    template: "%s | Amor Fati",
  },
  description: "Welcome to a world away from superficial: one with raw insights and emotions. This is for the bitter and the sweet.",
  keywords: ["Amor Fati", "Philosophy", "Stoicism", "Blog"],
  authors: [{ name: "JRoybalDev" }],
  creator: "JRoybalDev",
  metadataBase: new URL("https://unearthingamorfati.com"), // Replace with your actual domain
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Unearthing Amor Fati",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://unearthingamorfati.com",
    siteName: "Unearthing Amor Fati",
    title: "Unearthing Amor Fati",
    description: "Welcome to a world away from superficial: one with raw insights and emotions. This is for the bitter and the sweet.",
    images: [
      {
        url: "/OpenGraphImage-2.jpg", // Ensure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: "Unearthing Amor Fati",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unearthing Amor Fati",
    description: "Welcome to a world away from superficial: one with raw insights and emotions. This is for the bitter and the sweet.",
    images: ["/OpenGraphImage-2.jpg"],
  },
  icons: {
    icon: [
      { url: "/icon.svg?v=1", type: "image/svg+xml" },
      { url: "/favicon.ico?v=1" },
    ],
    shortcut: "/icon-32.png?v=1",
    apple: "/apple-touch-icon.png?v=1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${texturina.variable} ${manufacturingConsent.variable} ${pirataOne.variable}`}>
        <body className="font-texturina">
          <FilterProvider>
            <MainScrollShell nav={<Navbar />}>{children}</MainScrollShell>
          </FilterProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
