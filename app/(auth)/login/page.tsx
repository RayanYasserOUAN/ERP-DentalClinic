"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Stethoscope, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("admin@dentflow.com")
  const [password, setPassword] = useState("password")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-100/40 via-transparent to-transparent dark:from-teal-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent dark:from-blue-950/20" />

      <div className="relative flex w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-500/25">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading text-slate-900 dark:text-white">DentFlow</span>
              <p className="text-xs text-slate-400">Clinic ERP System</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              Demo credentials pre-filled
            </div>
            <h1 className="text-4xl font-bold font-heading text-slate-900 dark:text-white leading-tight">
              Streamline Your
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Dental Practice
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">
              Complete ERP solution for modern dental clinics. Manage patients, appointments, billing, inventory, and staff in one place.
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <span>© 2025 DentFlow</span>
            <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Terms</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex w-full lg:w-1/2 items-center justify-center p-8"
        >
          <div className="w-full max-w-sm space-y-8">
            <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-500/25">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold font-heading text-slate-900 dark:text-white">DentFlow</span>
                <p className="text-xs text-slate-400">Clinic ERP System</p>
              </div>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Welcome back</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-teal-600 dark:text-teal-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                    Remember me
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                  <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In...</>
                ) : (
                  <><span>Sign In</span><ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
