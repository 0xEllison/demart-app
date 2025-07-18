"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FormError } from "@/components/ui/form-error"
import { EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons"

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")

    if (!email || !password || !confirmPassword) {
      setError("请填写所有必填字段")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.text()

      if (!response.ok) {
        throw new Error(data || "注册失败，请稍后重试")
      }

      // 注册成功，跳转到登录页
      router.push("/login?registered=true")
    } catch (error) {
      setError(error instanceof Error ? error.message : "注册失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Link href="/" className="flex items-center justify-center text-2xl font-bold">
            DeMart
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            欢迎加入 DeMart 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            创建账户开启您的交易之旅 ✨
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium leading-none">
                  邮箱
                </label>
                <div className="relative">
                  <EnvelopeClosedIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={loading}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium leading-none">
                  密码
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="至少6位密码"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  密码长度至少为6位
                </p>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
                  确认密码
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="再次输入密码"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              {error && <FormError message={error} />}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "注册中..." : "创建账户 🚀"}
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          已有账户？{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            立即登录
          </Link>
        </p>
      </div>
    </div>
  )
} 