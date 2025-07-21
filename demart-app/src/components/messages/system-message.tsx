'use client'

import { cn } from "@/lib/utils"

interface SystemMessageProps {
  content: string
  timestamp: string
  className?: string
}

export function SystemMessage({ content, timestamp, className }: SystemMessageProps) {
  function formatMessageTime(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  return (
    <div className={cn("flex justify-center my-4", className)}>
      <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1.5 rounded-full max-w-[80%] text-center">
        <span>{content}</span>
        <span className="ml-2 opacity-70">{formatMessageTime(timestamp)}</span>
      </div>
    </div>
  )
} 