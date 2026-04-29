import type { Metadata } from 'next'
import { Epilogue, Space_Grotesk } from 'next/font/google'
import './globals.css'

const epilogue = Epilogue({
  subsets: ['latin'],
  weight: ['400', '700', '800', '900'],
  variable: '--font-epilogue',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-grotesk',
})

export const metadata: Metadata = {
  title: 'CodeDay London',
  description: 'CodeDay London event dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${epilogue.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-surface text-on-surface paper-grain min-h-screen">
        {children}
      </body>
    </html>
  )
}
