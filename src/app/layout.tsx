import './globals.css'
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { FilterProvider } from "@/context/FilterContext";
import Navbar from "../app/components/Navbar/Navbar";

export const viewport: Viewport = {
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: {
    default: "Amor Fati",
    template: "%s | Amor Fati",
  },
  description: "Explore the philosophy of Amor Fati through our collection of posts.",
  keywords: ["Amor Fati", "Philosophy", "Stoicism", "Blog"],
  authors: [{ name: "Amor Fati Team" }],
  creator: "Amor Fati",
  metadataBase: new URL("https://unearthingamorfati.com"), // Replace with your actual domain
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Amor Fati",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://unearthingamorfati.com",
    siteName: "Amor Fati",
    title: "Amor Fati",
    description: "Welcome to Amor Fati!",
    images: [
      {
        url: "/og-image.png", // Ensure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: "Amor Fati",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amor Fati",
    description: "Welcome to Amor Fati!",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-texturina">
          <FilterProvider>
            <div className="flex h-screen w-screen flex-col md:flex-row">
              <Navbar />
              <main className="h-screen w-full overflow-y-scroll bg-BGpage pt-[60px] md:pt-0">
                {children}
              </main>
            </div>
          </FilterProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
