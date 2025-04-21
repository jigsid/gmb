import { Geist_Mono, Inter, Figtree } from "next/font/google";
import "./globals.css";

// Primary font - Modern, clean sans-serif
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Backup/secondary font - Elegant with modern proportions
const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

// Monospace font for data and code
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f1729",
};

export const metadata = {
  title: "Business Comparison Tool - Compare Your Business with Competitors",
  description: "AI-powered tool to analyze your business performance against competitors. Get insights on reviews, SEO, and recommendations for improvement.",
  keywords: ["business analytics", "competitor analysis", "SEO comparison", "Google reviews", "business intelligence", "AI insights"],
  authors: [{ name: "Business Comparison Tool" }],
  creator: "Business Comparison Tool",
  metadataBase: new URL("https://business-comparison-tool.vercel.app"),
  openGraph: {
    title: "Business Comparison Tool",
    description: "AI-powered business comparison and analytics",
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: "summary_large_image",
    title: "Business Comparison Tool",
    description: "AI-powered business comparison and analytics",
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Always apply dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Always set dark mode
                document.documentElement.classList.add('dark');
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${figtree.variable} ${geistMono.variable} antialiased bg-background text-foreground relative min-h-screen flex flex-col`}
      >
        <main className="flex-grow">
          {children}
        </main>
        <footer className="w-full py-4 mt-auto border-t border-neutral-800">
          <div className="container-fluid text-center text-sm text-neutral-500">
            © {new Date().getFullYear()} Business Comparison Tool • All rights reserved
          </div>
        </footer>
      </body>
    </html>
  );
}
