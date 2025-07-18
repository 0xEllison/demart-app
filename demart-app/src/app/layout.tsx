import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SessionProvider } from "@/components/providers/session-provider"
import { AuthProvider } from "@/components/providers/auth-provider"
import Layout from "@/components/layout/layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeMart - 去中心化C2C交易平台",
  description: "DeMart是一个基于区块链技术的去中心化C2C交易平台，让每一次交易都简单、可靠。",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <SessionProvider>
          <AuthProvider>
            <Layout>{children}</Layout>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
