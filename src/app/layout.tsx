import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Bible Challenge',
  description: 'A bible reading goal app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />

        {/* Tells iOS Safari that this is a web app capable of running in full-screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/* Sets the status bar style on iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Sets the title for the app on the home screen */}
        <meta name="apple-mobile-web-app-title" content="Bible Challenge" />

        {/* You can also add Apple Touch Icons for iOS home screen icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
