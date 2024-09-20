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
const timestamp = Date.now();

export const metadata: Metadata = {
  title: "Play$Stakes - Ultimate Gaming & Staking Platform",
  description: "Join Play$Stakes for an exciting gaming and staking experience. The ultimate platform combining gaming and cryptocurrency staking.",
  openGraph: {
    title: "Play$Stakes - Ultimate Gaming & Staking",
    description: "Join Play$Stakes for an exciting gaming and staking experience. The ultimate platform combining gaming and cryptocurrency staking.",
    url: 'https://playsstakes.com',
    siteName: 'Play$Stakes',
    images: [
      {
        url: `${baseUrl}/images/og-image.jpg?v=${timestamp}`,
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@eneffti',
    creator: '@eneffti',
    title: "Play$Stakes - Ultimate Gaming & Staking",
    description: "Join Play$Stakes for an exciting gaming and staking experience. The ultimate platform combining gaming and cryptocurrency staking.",
    images: [`${baseUrl}/images/twitter-card.png?v=${timestamp}`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
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