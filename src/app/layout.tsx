// layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { FilterProvider } from "@/context/FilterContext";
import Navbar from "../app/components/Navbar/Navbar";

export const metadata: Metadata = {
  title: "Amor Fati",
  description: "Welcome to Amor Fati!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`w-screen h-screen flex flex-row font-inter`}>
          <FilterProvider>
            <Navbar />
            <main className={`w-screen h-screen bg-BGpage`}>
              {children}
            </main>
          </FilterProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
