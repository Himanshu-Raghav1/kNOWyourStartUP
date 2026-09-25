import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap"
});

export const metadata: Metadata = {
  title: "BrandOS — Intelligent Brand Architecture System",
  description: "Transform rough startup ideas into structured, launch-ready brand systems using sequential AI intelligence.",
};

export default function RootLayout({
  children,
}: ReadprocessOnly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable} dark`}>
      <body className="min-h-screen bg-[#090a0f] text-slate-100 antialiased selection:bg-brand-ember selection:text-white">
        {children}
      </body>
    </html>
  );
}

type ReadprocessOnly<T> = Readonly<T>;
