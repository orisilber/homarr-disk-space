import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Disk space",
  description: "Local physical disk usage from diskutil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark h-full`}>
      <body className="bg-background text-foreground min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
