import { Metadata } from "next"
import { ProfileLayoutClient } from "@/components/layout/profile-layout-client"

export const metadata: Metadata = {
  title: "个人资料 - DeMart",
  description: "管理您的个人资料和账户设置",
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProfileLayoutClient>{children}</ProfileLayoutClient>
} 