import React from 'react'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { TopNav } from '@/components/TopNav'

export const metadata = {
  title: 'Impact Realty AI - Multi-Agent Platform',
  description: 'Hierarchical agent orchestration for real estate operations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-inter bg-background-primary text-white antialiased">
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