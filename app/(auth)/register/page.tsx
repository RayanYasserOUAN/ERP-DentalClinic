"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Stethoscope, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await register(name, email, password)
      router.push("/login?registered=true")
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-100/40 via-transparent to-transparent dark:from-teal-950/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent dark:from-blue-950/20" />

      <div className="relative flex w-full">
        <div className="hidden lg:flex w-1/2 flex-col justify-between p-12">
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
            <h1 className="text-4xl font-bold font-heading text-slate-900 dark:text-white leading-tight">
              Join the Future of
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Dental Management
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed">
              Create your clinic account and start managing your practice with our comprehensive ERP solution.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex w-full lg:w-1/2 items-center justify-center p-8"
        >
          <div className="w-full max-w-sm space-y-8">
            <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg shadow-teal-500/25">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold font-heading text-slate-900 dark:text-white">DentFlow</span>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">Create account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Register your clinic to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="name@clinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50">
                  <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                ) : (
                  <><span>Create Account</span><ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="text-teal-600 dark:text-teal-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
