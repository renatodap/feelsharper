import type { Metadata } from "next";
import { Inter, Space_Grotesk, Orbitron, Russo_One } from "next/font/google";
import "./globals.css";
import "./brand.css";
import "./sharpened.css";
import "./sharpened-system.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { UpgradeBanner } from "@/components/premium/UpgradePrompt";
import { PWAProvider } from "@/components/pwa/PWAProvider";
import { OfflineIndicator } from "@/components/offline/OfflineIndicator";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const russoOne = Russo_One({
  subsets: ["latin"],
  variable: "--font-russo",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Feel Sharper | Your Sharpest Self, Every Day",
  description: "Your all-in-one performance platform — tracking your workouts, nutrition, and recovery while keeping you motivated through AI-driven coaching and community support.",
  keywords: ["fitness tracking", "workout log", "nutrition", "AI coaching", "performance", "health metrics", "recovery", "evidence-based"],
  authors: [{ name: "Feel Sharper" }],
  creator: "Feel Sharper",
  publisher: "Feel Sharper",
  metadataBase: new URL('https://feelsharper.com'),
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Feel Sharper | Your Sharpest Self, Every Day",
    description: "Your all-in-one performance platform — tracking your workouts, nutrition, and recovery while keeping you motivated through AI-driven coaching and community support.",
    url: 'https://feelsharper.com',
    siteName: 'Feel Sharper',
    type: 'website',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Feel Sharper - Your Sharpest Self, Every Day',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Feel Sharper | Your Sharpest Self, Every Day",
    description: "Your all-in-one performance platform — tracking your workouts, nutrition, and recovery with AI-driven coaching.",
    images: ['/images/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Feel Sharper',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Feel Sharper',
    'application-name': 'Feel Sharper',
    'msapplication-TileColor': '#0B2A4A',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#0B2A4A',
  },
};

/**
 * Root layout component - ensures single header/footer rendering
 * Provides consistent typography, theming, and layout structure
 * Fixed: Removed duplicate AskFeelSharper to prevent layout conflicts
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${orbitron.variable} ${russoOne.variable} scroll-smooth`}>
      <head>
        {/* Essential Icons Only */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className="font-sans antialiased min-h-screen bg-bg text-text-primary">
        <ThemeProvider>
          <AuthProvider>
            <PWAProvider>
              <UpgradeBanner />
              {children}
              <OfflineIndicator />
              <FeedbackButton />
            </PWAProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
