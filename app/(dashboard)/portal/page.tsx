"use client"

import { motion } from "framer-motion"
import { Calendar, FileText, CreditCard, MessageSquare, Download, ClipboardList, Stethoscope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { mockAppointments, mockInvoices } from "@/lib/data"
import { getInitials, formatCurrency, formatDate } from "@/lib/utils"

export default function PatientPortalPage() {
  const patientAppts = mockAppointments.filter((a) => a.patientId === "p1")
  const patientInvoices = mockInvoices.filter((i) => i.patientId === "p1")

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">Patient Portal</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">
          This is the patient-facing view. Patients can manage their care online.
        </p>
      </motion.div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-heading">Welcome, Sarah Johnson</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center hover:border-teal-200 dark:hover:border-teal-900/50 cursor-pointer transition-all">
                <Calendar className="h-8 w-8 text-teal-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">Book Appointment</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center hover:border-teal-200 dark:hover:border-teal-900/50 cursor-pointer transition-all">
                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">View Records</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center hover:border-teal-200 dark:hover:border-teal-900/50 cursor-pointer transition-all">
                <CreditCard className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">Make Payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 border-teal-200 dark:border-teal-900/30">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Stethoscope className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Next Appointment</p>
                <p className="text-xs text-slate-400">Tomorrow at 9:00 AM</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="primary">Check-up</Badge>
              <span className="text-xs text-slate-400">Dr. Emily White</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="appointments">
        <TabsList>
          <TabsTrigger value="appointments"><Calendar className="mr-2 h-4 w-4" />My Appointments</TabsTrigger>
          <TabsTrigger value="records"><ClipboardList className="mr-2 h-4 w-4" />Medical Records</TabsTrigger>
          <TabsTrigger value="billing"><CreditCard className="mr-2 h-4 w-4" />Billing</TabsTrigger>
          <TabsTrigger value="messages"><MessageSquare className="mr-2 h-4 w-4" />Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardContent className="p-0">
              {patientAppts.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 min-w-[60px]">
                      <span className="text-xs text-slate-400">{new Date(appt.date).toLocaleDateString("en", { month: "short" })}</span>
                      <span className="text-lg font-bold font-heading text-slate-900 dark:text-white">{new Date(appt.date).getDate()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{appt.type}</p>
                      <p className="text-xs text-slate-400">{appt.dentistName} · {appt.startTime}</p>
                    </div>
                  </div>
                  <Badge variant={appt.status === "completed" ? "success" : "primary"}>
                    {appt.status.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">Treatment History</p>
                      <p className="text-xs text-slate-400">Last updated May 2025</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">X-Ray Results</p>
                      <p className="text-xs text-slate-400">3 files available</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                </div>
              </div>
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
                    <p className="text-xs text-slate-400">{formatDate(inv.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(inv.total)}</span>
                    <Badge variant={inv.status === "paid" ? "success" : "warning"}>{inv.status}</Badge>
                    <Button variant="ghost" size="icon"><Download className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 text-center py-8">
                Secure messaging with your dental clinic. Start a conversation with your care team.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
