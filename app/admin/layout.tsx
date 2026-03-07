import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow px-6 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-augusta-green">
          Admin Dashboard
        </h1>
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-augusta-green"
        >
          ← Back to Leaderboard
        </Link>
      </div>
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow">
        {children}
      </div>
    </div>
  );
}
