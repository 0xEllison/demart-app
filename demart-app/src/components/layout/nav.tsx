import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Search, Compass, Store, Wallet } from "lucide-react"

export function MainNav() {
  return (
    <div className="flex flex-1 items-center justify-between space-x-2">
      <div className="w-full flex-1 md:w-auto md:flex-none relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="search"
          placeholder="搜索商品、服务或用户..."
          className="w-full md:w-[300px] lg:w-[400px] pl-9"
        />
      </div>
      <nav className="flex items-center space-x-6">
        <Link 
          href="/" 
          className="text-foreground/60 hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <Compass className="w-4 h-4" />
          探索
        </Link>
        <Link 
          href="/sell-create" 
          className="text-foreground/60 hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <Store className="w-4 h-4" />
          卖东西
        </Link>
        <Button className="flex items-center gap-1.5">
          <Wallet className="w-4 h-4" />
          连接钱包
        </Button>
      </nav>
    </div>
  )
} 