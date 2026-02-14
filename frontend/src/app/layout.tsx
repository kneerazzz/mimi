import type { Metadata, Viewport } from "next"; // Import Viewport
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/parts/Header";
import LoginModal from "@/components/auth/LoginModal";
import Footer from "@/components/parts/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// 1. NEW: Viewport Export (Fixes the warning)
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  // Basic Metadata
  title: {
    default: "Mimi - Create & Share Viral Memes",
    template: "%s | Mimi",
  },
  description:
    "Mimi is the ultimate meme creation and sharing platform. Create viral memes, discover trending content, explore thousands of templates, and join a community of meme enthusiasts. Free meme maker with AI-powered tools.",
  keywords: [
    "meme maker", "meme generator", "create memes", "funny memes",
    "viral memes", "meme templates", "meme creator", "dank memes",
    "meme community", "share memes", "trending memes", "custom memes",
    "meme editor", "free meme maker", "online meme creator", "meme builder",
  ],
  authors: [{ name: "Mimi Team", url: "https://mimi.vercel.app" }],
  creator: "Mimi",
  publisher: "Mimi",
  
  // App Configuration
  applicationName: "Mimi",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  metadataBase: new URL("https://mimi.vercel.app"),

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mimi.vercel.app",
    siteName: "Mimi",
    title: "Mimi - Create & Share Viral Memes",
    description: "The ultimate meme creation platform. Create viral memes with our free meme maker.",
    images: [
      {
        url: "/og-image.png", // Next.js finds this in public/og-image.png
        width: 1200,
        height: 630,
        alt: "Mimi - Create & Share Viral Memes",
        type: "image/png",
      },
      {
        url: "/og-image-square.png",
        width: 800,
        height: 800,
        alt: "Mimi Meme Maker Logo",
        type: "image/png",
      },
    ],
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Mimi - Create & Share Viral Memes",
    description: "Create viral memes with my free meme maker.",
    creator: "@kneerazzz",
    site: "@kneerazzz",
    images: ["/twitter-image.png"], // Next.js finds this in public/twitter-image.png
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#8b5cf6" },
    ],
  },

  manifest: "/manifest.json",
  
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mimi",
  },

  verification: {
    google: "google-site-verification-code",
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  alternates: {
    canonical: "https://mimi.vercel.app",
    languages: {
      "en-US": "https://mimi.vercel.app",
    },
  },

  category: "entertainment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Performance Optimization */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        
        {/* REMOVED: Viewport meta tag (now handled by export const viewport) */}
        
        {/* PWA Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#8b5cf6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Structured Data Scripts */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Mimi",
              "url": "https://mimi.vercel.app",
              "applicationCategory": "EntertainmentApplication",
              "operatingSystem": "Any",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
              "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "1000" },
              "description": "The ultimate meme creation and sharing platform.",
              "screenshot": "https://mimi.vercel.app/screenshot.png",
              "author": { "@type": "Organization", "name": "Mimi Team" }
            }),
          }}
        />
        {/* ... (Keep other scripts as they were) ... */}
      </head>
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            <Toaster 
              richColors 
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: '#18181b',
                  border: '1px solid #27272a',
                  color: '#fafafa',
                },
              }}
            />
            {children}
          </main>
          <LoginModal />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}