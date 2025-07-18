"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

// 预定义一组好看的背景色
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-rose-500",
  "bg-lime-500",
  "bg-amber-500",
];

// 根据字符串生成一个确定的索引
function getColorIndex(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % AVATAR_COLORS.length;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
    src?: string
    alt?: string
    fallbackText?: string
  }
>(({ className, src, alt, fallbackText, ...props }, ref) => {
  // 使用 alt 或 fallbackText 生成背景色
  const nameForColor = alt || fallbackText || "User";
  const colorClass = AVATAR_COLORS[getColorIndex(nameForColor)];
  
  // 获取显示文本（优先使用 fallbackText，然后是 alt 的首字母）
  const displayText = fallbackText || (alt ? alt.charAt(0).toUpperCase() : "U");
  
  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={alt}
        className="aspect-square h-full w-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full text-white font-medium",
          colorClass
        )}
      >
        {displayText}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
})
Avatar.displayName = AvatarPrimitive.Root.displayName

export { Avatar }
