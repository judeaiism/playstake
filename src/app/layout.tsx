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

export const metadata: Metadata = {
  title: "Play$Stake$",
  description: "Play$Stakes - Your ultimate gaming and staking platform",
  metadataBase: new URL(baseUrl),
  openGraph: {
    title: "Play$Stake$",
    description: "Play$Stakes - Your ultimate gaming and staking platform",
    images: [
      {
        url: `${baseUrl}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Play$Stakes Preview Image',
      },
    ],
    url: baseUrl,
    siteName: 'Play$Stakes',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Play$Stake$",
    description: "Play$Stakes - Your ultimate gaming and staking platform",
    images: [`${baseUrl}/images/twitter-image.jpg?v=${Date.now()}`],
    creator: '@eneffti',
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