"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bird, Wheat, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Lotes",
    href: "/",
    icon: Bird,
  },
  {
    title: "Alimentos",
    href: "/feed",
    icon: Wheat,
  },
  {
    title: "Ventas",
    href: "/sales",
    icon: ShoppingCart,
  },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Bird className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Avícola Llanadas</span>
            </Link>
            <div className="flex gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
