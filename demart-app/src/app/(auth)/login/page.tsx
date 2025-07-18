"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { FormError } from "@/components/ui/form-error"
import { EnvelopeClosedIcon, LockClosedIcon } from "@radix-ui/react-icons"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams?.get("registered")) {
      setSuccess("注册成功！请使用您的邮箱和密码登录")
    }
  }, [searchParams])

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")

    if (!email || !password) {
      setError("请填写所有必填字段")
      setLoading(false)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: email.toString(),
        password: password.toString(),
        redirect: false,
      })

      if (result?.error) {
        throw new Error("邮箱或密码错误")
      }

      router.push("/")
      router.refresh()
    } catch (error) {
      setError(error instanceof Error ? error.message : "登录失败，请稍后重试")
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
            欢迎回来 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            登录您的账户继续交易 💫
          </p>
        </div>

        <Card className="p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-4">
              {success && (
                <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-md flex items-center gap-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  <p>{success}</p>
                </div>
              )}
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
                    placeholder="输入密码"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    className="pl-9"
                  />
                </div>
              </div>
              {error && <FormError message={error} />}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "登录中..." : "登录 🔑"}
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          还没有账户？{" "}
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            立即注册
          </Link>
        </p>
      </div>
    </div>
  )
} 