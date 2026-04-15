import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { AuthProvider } from "@/context/auth-context";
import PostHogProvider from "@/components/posthog-provider";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.fpv-compass.xyz";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "FPV Compass — FPV Freestyle Trickionary & Skill Tree",
  description:
    "FPV Compass is the trickionary and skill tree for FPV freestyle pilots — every trick in the right order, linked to the best community tutorials.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "FPV Compass — FPV Freestyle Trickionary & Skill Tree",
    description:
      "FPV Compass is the trickionary and skill tree for FPV freestyle pilots — every trick in the right order, linked to the best community tutorials.",
    url: SITE_URL,
    siteName: "FPV Compass",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "FPV Compass",
              url: SITE_URL,
              description:
                "FPV Compass is the trickionary and skill tree for FPV freestyle pilots — every trick in the right order, linked to the best community tutorials.",
              potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/tricks?search={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "FPV Compass",
              url: SITE_URL,
              logo: `${SITE_URL}/icon.svg`,
            }),
          }}
        />
        <AuthProvider>
          <Suspense fallback={null}>
            <PostHogProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </PostHogProvider>
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
