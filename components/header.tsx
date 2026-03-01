import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="bg-augusta-green text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logopolla.png"
              alt="Polla Atlántica"
              width={180}
              height={60}
              className="h-10 md:h-14 w-auto"
              priority
            />
          </Link>
          <nav className="flex items-center space-x-6">
            <Link
              href="/"
              className="hover:text-augusta-gold transition-colors"
            >
              Leaderboard
            </Link>
            <Link
              href="/rules"
              className="hover:text-augusta-gold transition-colors"
            >
              Reglas
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
