import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
      {children}
    </div>
  );
}
