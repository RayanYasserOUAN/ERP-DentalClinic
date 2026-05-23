"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, ChevronLeft, ChevronRight, CalendarDays, Clock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getInitials } from "@/lib/utils"
import { appointmentsApi, patientsApi, staffApi } from "@/lib/api"

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
  const [appointments, setAppointments] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [dentists, setDentists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ patientId: "", dentistId: "", date: "", startTime: "", endTime: "", type: "checkup", notes: "" })

  useEffect(() => {
    async function load() {
      try {
        const [apptRes, patRes, dentRes] = await Promise.all([
          appointmentsApi.list({ limit: 100 }),
          patientsApi.list({ limit: 200 }),
          staffApi.dentists(),
        ])
        setAppointments(apptRes.data)
        setPatients(patRes.data)
        setDentists(dentRes.data)
      } catch (err) {
        console.error("Failed to load:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleCreateAppointment(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await appointmentsApi.create({ ...form, branchId: null, status: "booked" })
      setDialogOpen(false)
      setForm({ patientId: "", dentistId: "", date: "", startTime: "", endTime: "", type: "checkup", notes: "" })
      const result = await appointmentsApi.list({ limit: 100 })
      setAppointments(result.data)
    } catch (err: any) {
      console.error("Failed to create appointment:", err)
    } finally {
      setSaving(false)
    }
  }

  const todayDate = new Date().toISOString().split("T")[0]
  const todayApps = appointments.filter((a) => a.date === todayDate)
  const upcomingApps = appointments.filter((a) => a.date > todayDate)
  const pastApps = appointments.filter((a) => a.date < todayDate)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="default" className="h-9 sm:h-10 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Appointment</DialogTitle>
              <DialogDescription>Schedule a new patient appointment.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Patient</Label>
                <select className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-sm" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                  <option value="">Select patient</option>
                  {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Dentist</Label>
                <select className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-sm" required value={form.dentistId} onChange={(e) => setForm({ ...form, dentistId: e.target.value })}>
                  <option value="">Select dentist</option>
                  {dentists.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <select className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="checkup">Checkup</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="filling">Filling</option>
                    <option value="extraction">Extraction</option>
                    <option value="root_canal">Root Canal</option>
                    <option value="crown">Crown</option>
                    <option value="consultation">Consultation</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Start time</Label>
                  <Input type="time" required value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>End time</Label>
                  <Input type="time" required value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Create Appointment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-1 sm:gap-3">
          <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500 shrink-0" />
          <span className="text-sm sm:text-lg font-semibold font-heading text-slate-900 dark:text-white">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      <Tabs defaultValue="list">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <TabsList className="w-max sm:w-auto">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="timeline" className="mt-4">
          <div className="relative">
            {Array.from({ length: 10 }, (_, i) => i + 8).map((hour) => {
              const timeStr = `${hour.toString().padStart(2, "0")}:00`
              const hourApps = todayApps.filter((a: any) => a.startTime.startsWith(timeStr.slice(0, 2)))
              return (
                <div key={hour} className="flex border-b border-slate-100 dark:border-slate-800/50">
                  <div className="w-16 py-4 text-xs text-slate-400 text-center shrink-0">
                    {hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                  </div>
                  <div className="flex-1 py-1.5 px-2 min-h-[60px] flex gap-2 flex-wrap">
                    {hourApps.map((appt: any) => (
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
                        <Badge variant={statusColors[appt.status] || "default"} className="text-[9px] px-1.5 py-0">
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
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Date</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Time</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...todayApps, ...upcomingApps, ...pastApps].map((appt: any) => (
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
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-500">{appt.date}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400 shrink-0" />
                            {appt.startTime}-{appt.endTime}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <Badge variant={statusColors[appt.status] || "default"} className="text-[10px] sm:text-xs whitespace-nowrap">
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
      </Tabs>
    </div>
  )
}

