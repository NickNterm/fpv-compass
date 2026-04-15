import type { Metadata } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fpv-compass.xyz";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "What is FPV Compass?",
    answer:
      "FPV Compass is the trickionary and skill tree for FPV freestyle pilots — every trick in the right order, linked to the best community tutorials. It organizes tricks by difficulty and prerequisites and links each one to a hand-picked YouTube tutorial.",
  },
  {
    question: "Does FPV Compass host its own tutorial videos?",
    answer:
      "No. FPV Compass does not create or host video content. Every trick links out to existing YouTube tutorials from the FPV community, with full attribution to the original creators.",
  },
  {
    question: "What is the skill tree?",
    answer:
      "The skill tree is a visual progression graph that groups tricks into phases (Foundations, Basic, Intermediate, Advanced) and connects each trick to its prerequisites, so pilots always know what to learn next.",
  },
  {
    question: "How is trick difficulty rated?",
    answer:
      "Each trick has a difficulty score from 1 to 10, where 1 is a beginner fundamental and 10 is an elite-level maneuver. Difficulty is combined with prerequisites to build the progression tree.",
  },
  {
    question: "Do I need an account?",
    answer:
      "Browsing tricks, the skill tree, and community submissions is fully public and does not require an account. An account is only needed to mark tricks as learned, save favorites, submit community tricks, and comment.",
  },
  {
    question: "What are community tricks?",
    answer:
      "Community tricks are user-submitted FPV maneuvers that live in a separate section. Admins review submissions and can promote good ones into the official skill tree.",
  },
  {
    question: "What disciplines are covered?",
    answer:
      "The MVP covers FPV freestyle tricks only. Other disciplines like racing, cinematic, and long-range are planned as future phases.",
  },
  {
    question: "Can I see how many people liked a trick?",
    answer:
      "Yes. Each trick shows a public like count so pilots can see community interest, but the identities of the users who liked it are kept private.",
  },
];

export const metadata: Metadata = {
  title: "FAQ — FPV Compass",
  description:
    "Frequently asked questions about FPV Compass: the skill tree, community tricks, accounts, and how the project works.",
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
};

function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export default function FaqPage() {
  const jsonLd = faqJsonLd(FAQS);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold text-white">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-gray-400">
        Everything pilots and bots want to know about FPV Compass.
      </p>

      <div className="mt-10 space-y-6">
        {FAQS.map((item) => (
          <section
            key={item.question}
            className="rounded-xl border border-gray-800 bg-[#111827] p-6"
          >
            <h2 className="text-lg font-semibold text-white">
              {item.question}
            </h2>
            <p className="mt-3 text-gray-300 leading-relaxed">{item.answer}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
