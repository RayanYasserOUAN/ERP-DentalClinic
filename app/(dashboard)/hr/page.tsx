"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Users, Briefcase, Clock, UserCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getInitials, formatCurrency } from "@/lib/utils"
import { staffApi } from "@/lib/api"
import { logClientError } from "@/lib/client-logger"

export default function HRPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStaff() {
      try {
        const result = await staffApi.list()
        setStaff(result.data)
      } catch (err) {
        logClientError("Failed to load staff", err)
      } finally {
        setLoading(false)
      }
    }
    loadStaff()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const activeStaff = staff.filter((s: any) => s.status === "active")
  const onLeave = staff.filter((s: any) => s.status === "on_leave")
  const totalSalary = staff.reduce((s: number, m: any) => s + m.salary, 0)
  const dentists = staff.filter((s: any) => s.role === "dentist")

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">Staff & HR</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Manage staff, schedules, and payroll.</p>
        </div>
        <Button size="default" className="h-9 sm:h-10 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Staff</p>
              <p className="text-xl font-bold font-heading text-slate-900 dark:text-white">{staff.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active</p>
              <p className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">{activeStaff.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">On Leave</p>
              <p className="text-xl font-bold font-heading text-amber-600 dark:text-amber-400">{onLeave.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Payroll</p>
              <p className="text-xl font-bold font-heading text-teal-600 dark:text-teal-400">{formatCurrency(totalSalary)}/yr</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search staff..." className="pl-10" />
        </div>
        <Button variant="outline" size="sm">Department</Button>
        <Button variant="outline" size="sm">Shift</Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Staff</TabsTrigger>
          <TabsTrigger value="dentists">Dentists</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((member: any, i: number) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 ring-2 ring-slate-100 dark:ring-slate-800">
                      <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{member.name}</p>
                      <p className="text-xs text-slate-400 capitalize">{member.role.replace("_", " ")}</p>
                    </div>
                  </div>
                  <Badge
                    variant={member.status === "active" ? "success" : member.status === "on_leave" ? "warning" : "destructive"}
                    className="text-[10px]"
                  >
                    {member.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400">Department</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{member.department || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Shift</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{member.shift || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Salary</p>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(member.salary)}/yr</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Joined</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{member.joinDate || "-"}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dentists" className="mt-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {dentists.map((dentist: any) => (
              <div key={dentist.id} className="p-5 rounded-2xl border border-teal-200 dark:border-teal-900/50 bg-gradient-to-br from-teal-50/50 to-transparent dark:from-teal-950/20 dark:to-transparent">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white">
                      {getInitials(dentist.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{dentist.name}</p>
                    <p className="text-xs text-slate-400">{dentist.department || "General"}</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  <p>Shift: {dentist.shift || "Various"} · Salary: {formatCurrency(dentist.salary)}/yr</p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 text-center py-4">Active staff overview with attendance tracking.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 text-center py-4">Staff schedule and shift management.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
