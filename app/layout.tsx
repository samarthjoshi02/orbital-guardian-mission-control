import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Orbital Guardian - AI Space Traffic Management & Collision Prediction',
  description:
    'AI-powered space traffic management and space debris collision prediction platform. Monitor satellites, analyze risks, and execute avoidance decisions in real time.',
  keywords: 'space debris, satellite tracking, collision prediction, orbital mechanics, space traffic management, aerospace, NASA',
  authors: [{ name: 'DeepSpace Command' }],
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Courier+Prime&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-space-black text-starlight-white grid-overlay">
        {children}
      </body>
    </html>
  );
}
