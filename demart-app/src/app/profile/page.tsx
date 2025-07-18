"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { FormError } from "@/components/ui/form-error"

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, update, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userName, setUserName] = useState("")
  
  // 使用 useEffect 确保在会话加载完成后设置用户名
  useEffect(() => {
    if (session?.user?.name) {
      setUserName(session.user.name);
    }
  }, [session?.user?.name]);

  if (status === "loading") {
    return <div className="p-8 text-center">加载中...</div>;
  }

  if (!session?.user) {
    router.push("/login")
    return null
  }

  // 此时 session 一定不为 null，因为已经通过了上面的检查
  const user = session.user

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const name = formData.get("name") as string

      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      })

      if (!response.ok) {
        throw new Error("更新失败")
      }

      // 立即更新本地状态
      setUserName(name);
      
      // 更新会话中的用户信息
      await update({
        ...session,
        user: {
          ...user,
          name,
        },
      })

      setSuccess("个人资料更新成功")
    } catch (error) {
      setError(error instanceof Error ? error.message : "更新失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  // 获取用户名或邮箱用于头像显示
  const userDisplayName = userName || user.email?.split('@')[0] || "用户";
  
  // 获取用户名首字母或邮箱首字母
  const getInitial = () => {
    if (userName) {
      return userName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">个人资料</h3>
        <p className="text-sm text-muted-foreground">
          管理您的个人资料信息
        </p>
      </div>
      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar
              className="h-24 w-24"
              src={user.image || undefined}
              alt={userDisplayName}
              fallbackText={getInitial()}
            />
            <Button variant="outline" size="sm" disabled>
              更换头像
            </Button>
            <p className="text-xs text-muted-foreground">
              头像上传功能即将推出
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium leading-none">
                邮箱
              </label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
              />
              <p className="text-xs text-muted-foreground">
                邮箱地址不可更改
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none">
                昵称
              </label>
              <Input
                id="name"
                name="name"
                defaultValue={userName || ""}
                onChange={(e) => setUserName(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && <FormError message={error} />}
            {success && (
              <div className="bg-emerald-50 text-emerald-600 text-sm p-3 rounded-md flex items-center gap-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <p>{success}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "保存中..." : "保存修改"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
} 