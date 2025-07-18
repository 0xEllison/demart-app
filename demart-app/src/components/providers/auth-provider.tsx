"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * 需要登录的路径列表
 * 可以使用精确路径或路径前缀（以 * 结尾）
 */
const PROTECTED_PATHS = [
  "/profile",
  "/profile/*",
  "/messages",
  "/messages/*",
  "/products/create",
]

/**
 * 检查路径是否需要登录
 */
function isProtectedPath(path: string): boolean {
  return PROTECTED_PATHS.some(protectedPath => {
    if (protectedPath.endsWith("*")) {
      const prefix = protectedPath.slice(0, -1); // 移除 *
      return path.startsWith(prefix);
    }
    return path === protectedPath;
  });
}

/**
 * 全局登录状态保护组件
 * 用于保护需要登录的页面
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 如果路径需要登录且用户未登录，则重定向到登录页面
    if (pathname && isProtectedPath(pathname) && status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [status, pathname, router])

  return <>{children}</>
} 