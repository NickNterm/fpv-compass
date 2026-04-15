import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <p className="text-6xl font-bold text-gray-800">404</p>
      <h1 className="mt-4 text-xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">
        This trick doesn&apos;t exist yet. Maybe you should submit it?
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-xl bg-[var(--color-accent-500)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-600)]"
        >
          Go Home
        </Link>
        <Link
          href="/tricks"
          className="rounded-xl border border-gray-700 bg-gray-800 px-6 py-2.5 text-sm font-semibold text-gray-300 hover:bg-gray-700"
        >
          Browse Tricks
        </Link>
      </div>
    </div>
  );
}
