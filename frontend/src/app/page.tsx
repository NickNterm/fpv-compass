import Link from "next/link";
import Logo from "@/components/ui/logo";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center md:pb-24 md:pt-28">
          <div className="mb-6 flex justify-center">
            <Logo size={64} />
          </div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent-800)]/50 bg-[var(--color-accent-900)]/40 px-4 py-1.5 text-sm font-medium text-[var(--color-accent-400)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-accent-400)]" />
            Now Live
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            Every FPV trick.
            <br />
            <span className="text-[var(--color-accent-400)]">
              In the right order.
              <br />
              With the best videos.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl">
            FPV Compass is the trickionary and skill tree for FPV freestyle
            pilots — every trick in the right order, linked to the best
            community tutorials.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/tree"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-8 py-4 text-lg font-semibold text-white hover:bg-[var(--color-accent-600)] transition-colors"
            >
              Explore the Skill Tree
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/tricks"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-8 py-4 text-lg font-semibold text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Browse Tricks
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-gray-800/50 bg-[#0d1322]">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
          <h2 className="mb-4 text-center text-2xl font-bold text-white md:text-3xl">
            How FPV Compass works
          </h2>
          <p className="mb-14 text-center text-lg text-gray-500">
            Pick your style. Follow the path. Watch and learn.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-900)]/30 text-2xl">
                &#128506;
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Visual Skill Tree
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Step-by-step progression for freestyle. Every trick is placed in
                the <strong className="text-gray-200">right order</strong> so you
                always know what to learn next.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-900)]/30 text-2xl">
                &#127909;
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Community Videos
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Each trick links to the{" "}
                <strong className="text-gray-200">best tutorial videos</strong>{" "}
                from the FPV community. Real pilots, real footage, curated.
              </p>
            </div>
            <div className="rounded-2xl border border-gray-800 bg-[#111827] p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent-900)]/30 text-2xl">
                &#127942;
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                Track Your Progress
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                Mark tricks as learned, see your skill level grow, and unlock the
                next phase. From first hover to{" "}
                <strong className="text-gray-200">rubik&apos;s cubes.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
