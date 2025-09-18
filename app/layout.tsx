import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://solana-flappy-bird.vercel.app'),
  title: 'Solana Flappy Bird',
  description: 'Play, Earn, and Collect SOL Rewards!',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Solana Flappy Bird',
    description: 'Play, Earn, and Collect SOL Rewards!',
    images: ['/Bird2-export.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solana Flappy Bird',
    description: 'Play, Earn, and Collect SOL Rewards!',
    images: ['/Bird2-export.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}