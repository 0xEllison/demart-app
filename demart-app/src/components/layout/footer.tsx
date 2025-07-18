import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold">DeMart</span>
          </Link>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            让每一次交易都简单、可靠。
          </p>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            <Link
              href="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              关于我们
            </Link>
            <Link
              href="/terms"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              服务条款
            </Link>
            <Link
              href="/privacy"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              隐私政策
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
} 