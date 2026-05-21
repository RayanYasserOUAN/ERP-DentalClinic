"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus, ChevronLeft, ChevronRight, CalendarDays, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { mockAppointments } from "@/lib/data"
import { getInitials, formatTime } from "@/lib/utils"

const statusColors: Record<string, "primary" | "warning" | "success" | "info" | "destructive" | "default"> = {
  booked: "default",
  confirmed: "primary",
  waiting: "warning",
  in_treatment: "info",
  completed: "success",
  cancelled: "destructive",
  no_show: "destructive",
}

export default function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState("2025-05-21")

  const todayApps = mockAppointments.filter((a) => a.date === currentDate)
  const upcomingApps = mockAppointments.filter((a) => a.date > currentDate)
  const pastApps = mockAppointments.filter((a) => a.date < currentDate && a.date >= "2025-05-19")

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">Appointments</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Schedule and manage patient appointments.</p>
        </div>
        <Button size="default" className="h-9 sm:h-10 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </motion.div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-3">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate("2025-05-20")} className="h-8 w-8 sm:h-10 sm:w-10">
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500 shrink-0" />
            <span className="text-sm sm:text-lg font-semibold font-heading text-slate-900 dark:text-white truncate">
              <span className="hidden xs:inline">Wednesday, </span>May 21, 2025
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate("2025-05-22")} className="h-8 w-8 sm:h-10 sm:w-10">
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
        <Button variant="outline" size="sm" className="self-end sm:self-auto">
          Today
        </Button>
      </div>

      <Tabs defaultValue="timeline">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <TabsList className="w-max sm:w-auto">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="day">Day View</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="timeline" className="mt-4">
          <div className="relative">
            {Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => {
              const timeStr = `${hour.toString().padStart(2, "0")}:00`
              const hourApps = todayApps.filter((a) => a.startTime.startsWith(timeStr.slice(0, 2)))
              return (
                <div key={hour} className="flex border-b border-slate-100 dark:border-slate-800/50">
                  <div className="w-16 py-4 text-xs text-slate-400 text-center shrink-0">
                    {hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                  </div>
                  <div className="flex-1 py-1.5 px-2 min-h-[60px] flex gap-2 flex-wrap">
                    {hourApps.map((appt) => (
                      <motion.div
                        key={appt.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-200 dark:border-teal-900/50 cursor-pointer hover:shadow-md transition-all"
                      >
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px] bg-white dark:bg-slate-800">
                            {getInitials(appt.patientName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-medium text-slate-900 dark:text-white">{appt.patientName}</p>
                          <p className="text-[10px] text-slate-400">{appt.type} · {appt.startTime}</p>
                        </div>
                        <Badge variant={statusColors[appt.status]} className="text-[9px] px-1.5 py-0">
                          {appt.status.replace("_", " ")}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Patient</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Type</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Dentist</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Time</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Location</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...todayApps, ...upcomingApps, ...pastApps].map((appt) => (
                      <tr key={appt.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                              <AvatarFallback className="text-[10px] sm:text-xs">{getInitials(appt.patientName)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-900 dark:text-white truncate">{appt.patientName}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-500 hidden sm:table-cell">{appt.type}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-500 hidden md:table-cell">{appt.dentistName}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
                            {appt.startTime}-{appt.endTime}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-500 hidden lg:table-cell">{appt.room || appt.chair || "-"}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <Badge variant={statusColors[appt.status]} className="text-[10px] sm:text-xs whitespace-nowrap">
                            {appt.status.replace("_", " ")}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="day" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 text-center py-8">
                Calendar day view with drag-and-drop coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
