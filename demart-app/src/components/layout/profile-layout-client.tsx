"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface ProfileLayoutClientProps {
  children: React.ReactNode
}

export function ProfileLayoutClient({ children }: ProfileLayoutClientProps) {
  const pathname = usePathname();
  
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <Link
              href="/profile"
              className={cn(
                "inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground px-3 py-2",
                pathname === "/profile" && "bg-accent text-accent-foreground"
              )}
            >
              个人资料
            </Link>
            <Link
              href="/profile/address"
              className={cn(
                "inline-flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground px-3 py-2",
                pathname === "/profile/address" && "bg-accent text-accent-foreground"
              )}
            >
              地址管理
            </Link>
          </nav>
        </aside>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
} 