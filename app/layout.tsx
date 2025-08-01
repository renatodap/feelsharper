import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Feel Sharper - Peak Performance for Modern Men",
  description: "Evidence-based guidance to optimize your sleep, energy, libido, focus, and long-term vitality. No hype. Just results.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-brand-navy">
        {children}
      </body>
    </html>
  );
}
