import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import dynamic from 'next/dynamic';

const ClientProviders = dynamic(() => import('@/components/ClientProviders'), { ssr: false });
const FirebaseInitializer = dynamic(() => import('@/components/FirebaseInitializer'), { ssr: false });

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://playsstakes.com';
const timestamp = Date.now(); // For cache busting

export const metadata: Metadata = {
  title: "Play$Stake$",
  description: "Play$Stakes - Your ultimate gaming and staking platform",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Play$Stake$",
    description: "Play$Stakes - Your ultimate gaming and staking platform",
    images: [
      {
        url: `/images/og-image.jpg?v=${timestamp}`,
        width: 1200,
        height: 628,
        alt: 'Play$Stakes Preview Image',
      },
    ],
    url: '/',
    siteName: 'Play$Stakes',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Play$Stake$",
    description: "Play$Stakes - Your ultimate gaming and staking platform",
    images: [{
      url: `/images/twitter-image.jpg?v=${timestamp}`,
      width: 1200,
      height: 630,
      alt: 'Play$Stakes Preview Image',
    }],
    creator: '@eneffti',
    site: '@eneffti',
  },
  other: {
    'fb:app_id': '1466150140708234',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Explicit meta tags */}
        <meta property="og:title" content="Play$Stake$" />
        <meta property="og:description" content="Play$Stakes - Your ultimate gaming and staking platform" />
        <meta property="og:image" content={`${baseUrl}/images/og-image.jpg`} />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Play$Stakes" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@eneffti" />
        <meta name="twitter:creator" content="@eneffti" />
        <meta name="twitter:title" content="Play$Stake$" />
        <meta name="twitter:description" content="Play$Stakes - Your ultimate gaming and staking platform" />
        <meta name="twitter:image" content={`${baseUrl}/images/twitter-image.jpg?v=${timestamp}`} />
        <meta name="twitter:image:width" content="1200" />
        <meta name="twitter:image:height" content="630" />
        <meta name="twitter:image:alt" content="Play$Stakes Preview Image" />
      </head>
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        <ClientProviders>
          <FirebaseInitializer />
          <div className="flex">
            <main className="flex-1">{children}</main>
          </div>
        </ClientProviders>
        <Script
          src="https://atlos.io/packages/app/atlos.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}