import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '老邻居杂货铺',
  description: '您身边的线上杂货铺，线上下单，到店自提。',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className + " bg-slate-50 text-slate-800"}>
        {children}
      </body>
    </html>
  )
}
