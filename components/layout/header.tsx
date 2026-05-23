"use client"

import { useState, useEffect } from "react"
import { Bell, Search, LogOut, User, ChevronDown, Settings, Menu, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { notificationsApi } from "@/lib/api"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadNotifications() {
      try {
        const result = await notificationsApi.list()
        setNotifications(result.data)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 sm:gap-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-3 sm:px-4 lg:px-6">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 -ml-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative flex-1 max-w-[140px] sm:max-w-xs md:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Search..."
          className="pl-9 sm:pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl text-sm h-9 sm:h-10"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 md:flex">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9 sm:h-10 sm:w-10">
              <Bell className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] sm:text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 sm:w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-72 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No notifications</p>
              ) : (
                notifications.slice(0, 5).map((n: any) => (
                  <div key={n.id} className="flex items-start gap-3 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg mx-1 cursor-pointer transition-colors">
                    <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
                      n.type === "warning" ? "bg-amber-500" :
                      n.type === "success" ? "bg-emerald-500" :
                      n.type === "error" ? "bg-rose-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{n.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{n.message}</p>
                    </div>
                    {!n.read && <Badge variant="primary" className="h-1.5 w-1.5 p-0 rounded-full" />}
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 rounded-xl px-1.5 sm:px-2 h-9 sm:h-10">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage src="" />
                <AvatarFallback className="text-[10px] sm:text-xs bg-gradient-to-br from-teal-400 to-emerald-500 text-white">
                  {getInitials(user?.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                <p className="text-[11px] text-slate-400 leading-none mt-0.5 capitalize">{user?.role?.replace("_", " ") || ""}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-rose-500 dark:text-rose-400">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
