import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "Polla Atlántica - Torneo de Golf",
  description: "Leaderboard del torneo de golf de 4 días",
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

        {/* Sponsors section */}
        <section className="fluid-container mx-auto relative z-10">
          <div className="bg-white shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-augusta-green text-center mb-6">
              Sponsors
            </h2>
            <div className="flex justify-center items-center">
              <img
                src="/sponsors.png"
                alt="Tournament Sponsors"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Footer with solid background */}
        <footer className="bg-augusta-green text-white py-6 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Polla Atlántica. Torneo de Golf
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
