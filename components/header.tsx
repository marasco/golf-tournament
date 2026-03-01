import Link from "next/link";

export function Header() {
  return (
    <header className="bg-augusta-green text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-bold">Golf Tournament</h1>
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
              Rules
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
