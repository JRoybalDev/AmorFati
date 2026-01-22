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
        <body className="font-old-standard-tt">
          <FilterProvider>
            <div className={`w-screen h-screen flex flex-col md:flex-row`}>
              <Navbar />
              <main className={`w-full h-screen bg-BGpage overflow-y-scroll`}>
                {children}
              </main>
            </div>
          </FilterProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
