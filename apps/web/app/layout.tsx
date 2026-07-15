import type { Metadata } from "next";
import { Sora, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { Providers } from "@/providers";
import { Toaster } from "sonner";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const siteUrl = "https://flowmind.ai";

export const metadata: Metadata = {
  title: {
    default: "FlowMind AI — Liquid Intelligence",
    template: "%s — FlowMind AI",
  },
  description:
    "Build intelligent automation flows with AI-powered precision. Liquid intelligence for modern workflows. Connect tools, automate tasks, and orchestrate AI agents.",
  keywords: [
    "AI automation",
    "workflow automation",
    "AI agents",
    "flow builder",
    "intelligent automation",
    "no-code automation",
    "AI orchestration",
    "FlowMind",
  ],
  authors: [{ name: "FlowMind" }],
  creator: "FlowMind",
  publisher: "FlowMind",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "FlowMind AI",
    title: "FlowMind AI — Liquid Intelligence",
    description:
      "Build intelligent automation flows with AI-powered precision. Liquid intelligence for modern workflows.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FlowMind AI — Liquid Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlowMind AI — Liquid Intelligence",
    description:
      "Build intelligent automation flows with AI-powered precision. Liquid intelligence for modern workflows.",
    images: ["/og-image.png"],
    creator: "@flowmind",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  themeColor: "#0A0A0F",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "FlowMind",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      sameAs: [
        "https://twitter.com/flowmind",
        "https://github.com/flowmind",
      ],
      description:
        "Build intelligent automation flows with AI-powered precision.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "FlowMind AI",
      description:
        "Build intelligent automation flows with AI-powered precision. Liquid intelligence for modern workflows.",
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "FlowMind AI",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "AI-powered workflow automation platform. Build, deploy, and monitor intelligent automation flows with ease.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      author: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${instrumentSans.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen scrollbar-premium">
        <a
          href="#main-content"
          className="skip-link"
        >
          Skip to main content
        </a>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            expand
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
                borderRadius: "var(--radius)",
              },
              className: "shadow-lg backdrop-blur-xl",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
