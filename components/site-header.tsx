"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { GraduationCap, Store, Landmark, LogIn, UserPlus, Menu, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { ProfileDropdown } from "@/components/auth/profile-dropdown"

const nav = [
  { href: "/training", label: "Training", Icon: GraduationCap },
  { href: "/marketplace", label: "Marketplace", Icon: Store },
  { href: "/schemes", label: "Schemes", Icon: Landmark },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3 group" aria-label="Sakhi Seva Home">
          <div className="relative h-10 w-auto">
            <Image
              src="/logo_ss.jpg"
              alt="Sakhi Seva Logo"
              width={120}
              height={40}
              className="h-full w-auto object-contain group-hover:opacity-90 transition-opacity"
              priority
            />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground group-hover:opacity-90 transition-opacity">
            Sakhi Seva
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {nav.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <motion.div
                key={href}
                whileHover={{ y: -1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon aria-hidden className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Auth actions */}
        <div className="hidden items-center gap-2 md:flex">
          {loading ? (
            <div className="h-9 w-20 animate-pulse bg-muted rounded-lg" />
          ) : user ? (
            <ProfileDropdown />
          ) : (
            <>
              <motion.div whileHover={{ y: -1 }}>
                <Link
                  href="/auth/login"
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/auth/login"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground",
                  )}
                  aria-label="Log in"
                >
                  <LogIn aria-hidden className="h-4 w-4" />
                  <span>Log in</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -1 }}>
                <Link
                  href="/auth/signup"
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                  aria-label="Sign up"
                >
                  <UserPlus aria-hidden className="h-4 w-4" />
                  <span>Sign up</span>
                </Link>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              aria-label="Open menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-auto">
                    <Image
                      src="/logo_ss.jpg"
                      alt="Sakhi Seva Logo"
                      width={96}
                      height={32}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <span className="text-lg font-semibold tracking-tight text-foreground">
                    Sakhi Seva
                  </span>
                </div>
              </SheetHeader>
              <nav aria-label="Mobile primary" className="mt-4 grid gap-1">
                {nav.map(({ href, label, Icon }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/85 hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <Icon aria-hidden className="h-5 w-5" />
                      <span>{label}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-6 grid gap-2">
                {loading ? (
                  <div className="h-12 w-full animate-pulse bg-muted rounded-lg" />
                ) : user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {user.fullName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-accent w-full"
                    >
                      <LogOut aria-hidden className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium hover:bg-accent"
                    >
                      <LogIn aria-hidden className="h-4 w-4" />
                      Log in
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
                    >
                      <UserPlus aria-hidden className="h-4 w-4" />
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
