import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "kNOWyourStartUP — Turn your idea into a real brand",
  description: "Go from a rough idea to a launch-ready brand identity in minutes. Smart, simple, made for founders.",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({
  children,
}: ReadprocessOnly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} dark`}>
      <body className="min-h-screen bg-[#090D16] text-[#F8FAFC] antialiased selection:bg-[#FF542E]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}

type ReadprocessOnly<T> = Readonly<T>;
