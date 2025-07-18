"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  History, 
  PlusCircle, 
  MessageSquare, 
  LogOut, 
  LogIn, 
  UserPlus,
  Home
} from "lucide-react"

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // 获取用户首字母用于头像
  const getUserInitial = (user: any) => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // 获取用户显示名称
  const getUserDisplayName = (user: any) => {
    return user?.name || (user?.email ? user.email.split('@')[0] : "用户");
  };

  // 检查链接是否为当前页面
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Home className="h-5 w-5" />
            <span className="text-xl font-bold">DeMart</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-3">
            <Link 
              href="/browse-history" 
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-muted",
                isActive("/browse-history") ? "text-primary bg-muted" : "text-foreground/80"
              )}
            >
              <History className="h-4 w-4" />
              <span>浏览记录</span>
            </Link>
            
            {status === "loading" && (
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            )}
            
            {status === "authenticated" && session?.user && (
              <>
                <Link 
                  href="/products/create" 
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-muted",
                    isActive("/products/create") ? "text-primary bg-muted" : "text-foreground/80"
                  )}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>发布商品</span>
                </Link>
                <Link 
                  href="/messages" 
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium transition-colors hover:bg-muted",
                    isActive("/messages") ? "text-primary bg-muted" : "text-foreground/80"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>消息</span>
                </Link>
                <div className="h-4 w-px bg-border mx-1"></div>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full overflow-hidden"
                  asChild
                >
                  <Link href="/profile">
                    <Avatar
                      className="h-8 w-8"
                      src={session.user.image || undefined}
                      alt={getUserDisplayName(session.user)}
                      fallbackText={getUserInitial(session.user)}
                    />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-foreground/80 hover:text-foreground"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4" />
                  <span>退出</span>
                </Button>
              </>
            )}
            
            {status === "unauthenticated" && (
              <>
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5" asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    <span>登录</span>
                  </Link>
                </Button>
                <Button size="sm" className="flex items-center gap-1.5" asChild>
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    <span>注册</span>
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
} 