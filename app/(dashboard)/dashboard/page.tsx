"use client"

import { motion } from "framer-motion"
import { CalendarDays, Users, Activity, DollarSign, TrendingUp, Clock, AlertTriangle, Stethoscope } from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { getDashboardStats, mockAppointments, getMonthlyRevenue } from "@/lib/data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, formatTime } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function DashboardPage() {
  const stats = getDashboardStats()
  const revenueData = getMonthlyRevenue()
  const todayAppts = mockAppointments.filter((a) => a.date === "2025-05-21")

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Welcome back, Dr. White. Here&apos;s your clinic overview.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
          <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>May 21, 2025</span>
        </div>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Today's Appointments"
          value={stats.todaysAppointments}
          change={stats.appointmentChange}
          changeLabel="vs last week"
          icon={CalendarDays}
          variant="teal"
          index={0}
        />
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients}
          change={stats.patientChange}
          changeLabel="this month"
          icon={Users}
          variant="blue"
          index={1}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.monthlyEarnings.toLocaleString()}`}
          change={stats.revenueChange}
          changeLabel="vs last month"
          icon={DollarSign}
          variant="amber"
          index={2}
        />
        <StatsCard
          title="Pending Payments"
          value={`$${stats.pendingPayments.toLocaleString()}`}
          icon={Clock}
          variant="rose"
          index={3}
        />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-heading">Revenue Overview</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Monthly revenue vs expenses</p>
            </div>
            <Badge variant="primary" className="px-3 py-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="h-[200px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.87 0 0)" className="dark:opacity-20" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid oklch(0.87 0 0)",
                      background: "oklch(0.98 0 0)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2} fill="url(#revenueGradient)" />
                  <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Activity className="h-4 w-4 text-teal-500" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayAppts.slice(0, 6).map((appt, i) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {getInitials(appt.patientName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{appt.patientName}</p>
                  <p className="text-xs text-slate-400 truncate">{appt.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{appt.startTime}</p>
                  <Badge
                    variant={
                      appt.status === "confirmed" ? "primary" :
                      appt.status === "waiting" ? "warning" :
                      appt.status === "in_treatment" ? "info" :
                      "default"
                    }
                    className="text-[9px] px-1.5 py-0"
                  >
                    {appt.status.replace("_", " ")}
                  </Badge>
                </div>
              </motion.div>
            ))}
            {todayAppts.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">No appointments today</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200 dark:border-amber-900/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold font-heading text-amber-700 dark:text-amber-300">{stats.lowStockItems}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">Low Stock Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-200 dark:border-teal-900/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold font-heading text-teal-700 dark:text-teal-300">{stats.activeTreatments}</p>
              <p className="text-xs text-teal-600 dark:text-teal-400">Active Treatments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold font-heading text-blue-700 dark:text-blue-300">{stats.staffOnDuty}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">Staff on Duty</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-900/30">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold font-heading text-rose-700 dark:text-rose-300">{stats.waitingPatients}</p>
              <p className="text-xs text-rose-600 dark:text-rose-400">Waiting Patients</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
