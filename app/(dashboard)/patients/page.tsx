"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, Star, Eye, Edit2, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { getInitials, formatDate, formatCurrency } from "@/lib/utils"
import { patientsApi } from "@/lib/api"
import { logClientError } from "@/lib/client-logger"
import Link from "next/link"

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterVip, setFilterVip] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({ name: "", gender: "male", dateOfBirth: "", phone: "", email: "", address: "", bloodGroup: "", notes: "", vip: false })

  useEffect(() => {
    loadPatients()
  }, [searchQuery, filterVip])

  async function loadPatients() {
    try {
      const params: Record<string, string | number | boolean> = { limit: 100 }
      if (searchQuery) params.search = searchQuery
      if (filterVip) params.vip = true
      const result = await patientsApi.list(params)
      setPatients(result.data)
    } catch (err) {
      logClientError("Failed to load patients", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await patientsApi.create(form)
      setDialogOpen(false)
      setForm({ name: "", gender: "male", dateOfBirth: "", phone: "", email: "", address: "", bloodGroup: "", notes: "", vip: false })
      await loadPatients()
    } catch (err: any) {
      logClientError("Failed to create patient", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">Patients</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
            Manage patient records, history, and profiles.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="default" className="h-9 sm:h-10">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Patient</DialogTitle>
              <DialogDescription>Enter the patient details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPatient} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <select className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Date of birth</Label>
                  <Input type="date" required value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1-555-0100" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="patient@email.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main St" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Blood group</Label>
                  <Input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} placeholder="A+" />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.vip} onChange={(e) => setForm({ ...form, vip: e.target.checked })} className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">VIP patient</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Patient"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search patients..."
            className="pl-10 h-9 sm:h-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className={filterVip ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-xs sm:text-sm" : "text-xs sm:text-sm"}
          onClick={() => setFilterVip(!filterVip)}
        >
          <Star className="mr-1.5 h-3.5 w-3.5" />
          VIP Only
        </Button>
      </div>

      <Tabs defaultValue="all">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <TabsList>
            <TabsTrigger value="all">All Patients</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="vip">VIP</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800">
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Patient</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Contact</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Blood</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Last Visit</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Visits</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Total Spent</th>
                        <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden xl:table-cell">Tags</th>
                        <th className="w-12 px-3 sm:px-6 py-3 sm:py-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((patient: any, i: number) => (
                        <motion.tr
                          key={patient.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <Link href={`/patients/${patient.id}`} className="flex items-center gap-2 sm:gap-3">
                              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                                <AvatarImage src={patient.avatar} />
                                <AvatarFallback className={patient.vip ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"}>
                                  {getInitials(patient.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                                  {patient.name}
                                  {patient.vip && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
                                </p>
                                <p className="text-xs text-slate-400 truncate capitalize">{patient.gender} · {patient.date_of_birth?.slice(0, 10) || patient.dateOfBirth}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate max-w-[160px]">
                                <Mail className="h-3 w-3 shrink-0" /> {patient.email || "—"}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone className="h-3 w-3 shrink-0" /> {patient.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{patient.blood_group || patient.bloodGroup || "—"}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">
                            <span className="text-sm text-slate-500">{patient.last_visit ? formatDate(patient.last_visit) : patient.lastVisit ? formatDate(patient.lastVisit) : "N/A"}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{patient.total_visits || patient.totalVisits}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(patient.total_spent || patient.totalSpent)}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden xl:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {(patient.tags || []).map((tag: string) => (
                                <Badge key={tag} variant={tag === "VIP" ? "primary" : tag === "Blacklisted" ? "destructive" : "default"} className="text-[10px] px-2 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                                  <MoreHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                                <DropdownMenuItem><Edit2 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-rose-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {[...patients].sort((a: any, b: any) => new Date(b.last_visit || b.lastVisit || "").getTime() - new Date(a.last_visit || a.lastVisit || "").getTime()).slice(0, 6).map((patient: any) => (
                    <Link key={patient.id} href={`/patients/${patient.id}`}>
                      <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-900/50 transition-all duration-200">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white">{getInitials(patient.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                          <p className="text-xs text-slate-400">Last visit: {patient.last_visit ? formatDate(patient.last_visit) : patient.lastVisit ? formatDate(patient.lastVisit) : "Never"}</p>
                          <p className="text-xs text-teal-600 dark:text-teal-400 mt-0.5">{formatCurrency(patient.total_spent || patient.totalSpent)} total</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vip">
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {patients.filter((p: any) => p.vip).map((patient: any) => (
                    <div key={patient.id} className="flex items-center gap-4 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/50 to-transparent dark:from-amber-950/20 dark:to-transparent">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">{getInitials(patient.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                          {patient.name}
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </p>
                        <p className="text-xs text-slate-400">{patient.phone}</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">{patient.total_visits || patient.totalVisits} visits</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
