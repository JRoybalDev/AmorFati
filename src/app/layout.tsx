import './globals.css'
import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { FilterProvider } from "@/context/FilterContext";
import Navbar from "../app/components/Navbar/Navbar";

export const viewport: Viewport = {
  themeColor: "#BE5103",
};

export const metadata: Metadata = {
  title: {
    default: "Amor Fati",
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
    title: "Amor Fati",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://unearthingamorfati.com",
    siteName: "Amor Fati",
    title: "Amor Fati",
    description: "Welcome to a world away from superficial: one with raw insights and emotions. This is for the bitter and the sweet.",
    images: [
      {
        url: "/OpenGraphImage-2.jpg", // Ensure this image exists in your public folder
        width: 1200,
        height: 630,
        alt: "Amor Fati",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amor Fati",
    description: "Welcome to a world away from superficial: one with raw insights and emotions. This is for the bitter and the sweet.",
    images: ["/OpenGraphImage-2.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon-32.png",
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
