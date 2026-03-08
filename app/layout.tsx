import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Biguá Golf",
  description: "Leaderboard de los Biguá",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen relative">
        {/* Background image with overlay */}
        <div className="fixed inset-0 -z-10">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images-carilo.jpeg')" }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Header with solid background */}
        <Header />

        {/* Main content */}
        <main className="container mx-auto px-4 py-8 relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
