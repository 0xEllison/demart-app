import { Metadata } from "next"

export const metadata: Metadata = {
  title: "认证 - DeMart",
  description: "登录或注册 DeMart 账户",
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 