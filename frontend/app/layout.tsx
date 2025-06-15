import React from 'react'
import './globals.css'
import { Inter, Orbitron } from 'next/font/google'
import { Sidebar } from '@/components/Sidebar'
import { TopNav } from '@/components/TopNav'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata = {
  title: 'Impact Realty AI - Hierarchical Agent Platform',
  description: 'Multi-agent orchestration for real estate operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${orbitron.variable} font-sans bg-[#0C0F1A] text-white antialiased`}>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopNav />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
} 