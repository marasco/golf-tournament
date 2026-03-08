"use client";

import { useCurrentPlayer } from "@/lib/use-current-player";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { player, logout, loaded } = useCurrentPlayer();

  return (
    <header className="bg-augusta-green text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        {/* Desktop */}
        <div className="hidden md:flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/logopolla.png"
              alt="Biguá Golf"
              width={180}
              height={60}
              className="h-14 w-auto"
              priority
            />
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="hover:text-augusta-gold transition-colors">
              Leaderboard
            </Link>
            <Link href="/play" className="hover:text-augusta-gold transition-colors font-semibold">
              Jugar
            </Link>
            <Link href="/rules" className="hover:text-augusta-gold transition-colors">
              Reglas
            </Link>
            {loaded && player && (
              <div className="flex items-center gap-2 text-sm border-l border-white/30 pl-6">
                <span className="text-white/80">{player.name}</span>
                <button
                  onClick={logout}
                  className="text-white/50 hover:text-white transition-colors text-xs underline"
                >
                  Cambiar
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center justify-center relative">
          <Link href="/" className="flex items-center">
            <Image
              src="/logopolla.png"
              alt="Biguá Golf"
              width={180}
              height={60}
              className="h-10 w-auto"
              priority
            />
          </Link>
          <button
            onClick={() => setMenuOpen(true)}
            className="absolute right-0 p-2"
            aria-label="Abrir menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-augusta-green z-50 shadow-2xl transform transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-white"
            aria-label="Cerrar menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col px-6 space-y-6">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-lg font-semibold hover:text-augusta-gold transition-colors">
            Leaderboard
          </Link>
          <Link href="/play" onClick={() => setMenuOpen(false)} className="text-lg font-semibold hover:text-augusta-gold transition-colors">
            Jugar
          </Link>
          <Link href="/rules" onClick={() => setMenuOpen(false)} className="text-lg font-semibold hover:text-augusta-gold transition-colors">
            Reglas
          </Link>
        </nav>
      </div>
    </header>
  );
}
