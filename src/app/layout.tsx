import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

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

export const metadata: Metadata = {
  title: "Play$Stake$",
  description: "Play$Stakes - Your ultimate gaming and staking platform",
  openGraph: {
    title: "Play$Stake$",
    description: "Play$Stakes - Your ultimate gaming and staking platform",
    images: [
      {
        url: 'https://playsstakes.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Play$Stakes Preview Image',
      },
    ],
    url: 'https://playsstakes.com',
    siteName: 'Play$Stakes',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Play$Stake$",
    description: "Play$Stakes - Your ultimate gaming and staking platform",
    images: ['https://playsstakes.com/images/twitter-image.jpg'],
    creator: '@playstakes',
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
        <Script
          src="https://atlos.io/packages/app/atlos.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}