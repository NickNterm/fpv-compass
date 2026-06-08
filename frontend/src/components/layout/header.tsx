"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import Logo from "@/components/ui/logo";

export default function Header() {
  const { user, isLoading, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-[#0a0f1e]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} />
            <span className="text-sm font-bold text-white">FPV Compass</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/tree"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              Skill Tree
            </Link>
            <Link
              href="/tricks"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              All Tricks
            </Link>
            <Link
              href="/community"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              Community
            </Link>
            <Link
              href="/blog"
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              Blog
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/ideas"
            className="flex items-center gap-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-1.5 text-xs font-medium text-yellow-400 transition-colors hover:border-yellow-500/40 hover:bg-yellow-500/10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6M10 22h4M12 2a7 7 0 0 1 4 12.7V17H8v-2.3A7 7 0 0 1 12 2z" />
            </svg>
            Feedback
          </Link>
          {isLoading ? (
            <div className="h-6 w-20 animate-pulse rounded bg-gray-800" />
          ) : user ? (
            <>
              <Link
                href="/profile"
                className="flex h-7 w-7 items-center justify-center rounded bg-[var(--color-accent-500)] text-[10px] font-bold text-white"
              >
                {user.display_name.slice(0, 2).toUpperCase()}
              </Link>
              <button
                onClick={logout}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-gray-400 hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-[var(--color-accent-500)] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-accent-600)]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
