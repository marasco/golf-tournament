import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Golf Tournament Leaderboard",
  description: "Track tournament scores and standings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">{children}</main>
        <footer className="bg-augusta-green text-white mt-12 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Golf Tournament. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
