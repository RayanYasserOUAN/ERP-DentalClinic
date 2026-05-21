"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, AlertTriangle, Star, FileText, Download } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { mockPatients, mockAppointments, mockTreatments, mockInvoices } from "@/lib/data"
import { getInitials, formatCurrency, formatDate } from "@/lib/utils"

export default function PatientDetailPage() {
  const params = useParams()
  const patient = mockPatients.find((p) => p.id === params.id)

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Patient not found</h2>
          <Link href="/patients" className="text-teal-600 dark:text-teal-400 hover:underline mt-2 inline-block">
            Back to patients
          </Link>
        </div>
      </div>
    )
  }

  const patientAppointments = mockAppointments.filter((a) => a.patientId === patient.id)
  const patientTreatments = mockTreatments.filter((t) => t.patientId === patient.id)
  const patientInvoices = mockInvoices.filter((i) => i.patientId === patient.id)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-start gap-3"
      >
        <div className="flex items-center gap-3 w-full">
          <Link href="/patients">
            <Button variant="ghost" size="icon" className="rounded-full shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 ring-2 ring-teal-200 dark:ring-teal-900/50">
              <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-sm sm:text-lg">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold font-heading text-slate-900 dark:text-white truncate">{patient.name}</h1>
                {patient.vip && <Star className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 fill-amber-400 text-amber-400" />}
                {patient.blacklisted && <Badge variant="destructive" className="text-[10px]">Blacklisted</Badge>}
              </div>
              <p className="text-xs sm:text-sm text-slate-400 truncate">
                Patient ID: {patient.id.toUpperCase()} · {patient.gender === "male" ? "Male" : "Female"} · {patient.dateOfBirth}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:shrink-0">
          <Button variant="outline" size="sm" className="text-xs h-8 sm:h-9">
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden xs:inline">Records</span>
          </Button>
          <Button size="sm" className="text-xs h-8 sm:h-9">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden xs:inline">Book</span>
            <span className="xs:hidden">Book</span>
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-heading">Patient Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">{patient.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">{patient.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">Born: {patient.dateOfBirth}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 dark:text-slate-400">Blood: {patient.bloodGroup}</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Insurance</p>
              {patient.insuranceProvider ? (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{patient.insuranceProvider}</p>
                  <p className="text-xs text-slate-400">ID: {patient.insuranceNumber}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No insurance on file</p>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Allergies</p>
              {patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((a) => (
                    <Badge key={a} variant="destructive" className="text-xs">{a}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">No known allergies</p>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {patient.tags.map((tag) => (
                  <Badge key={tag} variant={tag === "VIP" ? "primary" : "default"} className="text-xs">{tag}</Badge>
                ))}
                {patient.tags.length === 0 && <p className="text-sm text-slate-400">No tags</p>}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xl font-bold font-heading text-slate-900 dark:text-white">{patient.totalVisits}</p>
                <p className="text-xs text-slate-400">Total Visits</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xl font-bold font-heading text-emerald-600 dark:text-emerald-400">{formatCurrency(patient.totalSpent)}</p>
                <p className="text-xs text-slate-400">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="appointments">
            <TabsList>
              <TabsTrigger value="appointments">Appointments</TabsTrigger>
              <TabsTrigger value="treatments">Treatments</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="appointments" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {patientAppointments.map((appt, i) => (
                    <motion.div
                      key={appt.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{appt.startTime}</span>
                          <span className="text-xs text-slate-400">{appt.date}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{appt.type}</p>
                          <p className="text-xs text-slate-400">{appt.dentistName}</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          appt.status === "completed" ? "success" :
                          appt.status === "confirmed" ? "primary" :
                          appt.status === "cancelled" ? "destructive" :
                          appt.status === "no_show" ? "destructive" :
                          "warning"
                        }
                      >
                        {appt.status.replace("_", " ")}
                      </Badge>
                    </motion.div>
                  ))}
                  {patientAppointments.length === 0 && (
                    <p className="text-sm text-slate-400 text-center py-8">No appointments found</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="treatments" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {patientTreatments.map((t) => (
                    <div key={t.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{t.procedure}</p>
                        <p className="text-xs text-slate-400">{t.dentistName} · {t.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(t.cost)}</span>
                        <Badge
                          variant={
                            t.status === "completed" ? "success" :
                            t.status === "in_progress" ? "info" :
                            t.status === "planned" ? "warning" :
                            "default"
                          }
                        >
                          {t.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {patientInvoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
                        <p className="text-xs text-slate-400">{formatDate(inv.createdAt)} · {inv.items.length} item(s)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(inv.total)}</span>
                        <Badge
                          variant={
                            inv.status === "paid" ? "success" :
                            inv.status === "pending" ? "warning" :
                            inv.status === "overdue" ? "destructive" :
                            inv.status === "partial" ? "info" :
                            "default"
                          }
                        >
                          {inv.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-500 italic">{patient.notes || "No clinical notes recorded for this patient."}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
