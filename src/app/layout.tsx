import './globals.css'
import type { Metadata } from "next";
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
