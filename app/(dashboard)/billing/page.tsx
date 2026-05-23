"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Download, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/lib/utils"
import { billingApi } from "@/lib/api"

const statusColors: Record<string, "success" | "warning" | "destructive" | "info" | "default"> = {
  paid: "success",
  pending: "warning",
  overdue: "destructive",
  partial: "info",
  draft: "default",
  cancelled: "default",
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBilling() {
      try {
        const [invResult, summaryResult] = await Promise.all([
          billingApi.list({ limit: 100 }),
          billingApi.summary(),
        ])
        setInvoices(invResult.data)
        setSummary(summaryResult.data)
      } catch (err) {
        console.error("Failed to load billing data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadBilling()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const totalRevenue = invoices.reduce((s: number, i: any) => s + i.total, 0)
  const totalPaid = invoices.reduce((s: number, i: any) => s + i.paid, 0)
  const totalPending = invoices.filter((i: any) => i.status === "pending" || i.status === "overdue").reduce((s: number, i: any) => s + i.total - i.paid, 0)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">Billing</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Manage invoices, payments, and financial records.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 sm:h-10">
            <Download className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Export</span>
          </Button>
          <Button size="sm" className="h-9 sm:h-10">
            <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">New Invoice</span>
            <span className="xs:hidden">New</span>
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-bold font-heading text-slate-900 dark:text-white mt-1">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Collected</p>
            <p className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 mt-1">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending</p>
            <p className="text-2xl font-bold font-heading text-amber-600 dark:text-amber-400 mt-1">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search invoices..." className="pl-10 h-9 sm:h-10" />
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <TabsList className="w-max sm:w-auto">
            <TabsTrigger value="all">All Invoices</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Invoice</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Patient</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Date</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">Items</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Total</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Paid</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Status</th>
                      <th className="w-12 px-3 sm:px-6 py-3 sm:py-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv: any, i: number) => (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono font-medium text-slate-900 dark:text-white">{inv.invoiceNumber}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300">{inv.patientName}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500 hidden sm:table-cell">{formatDate(inv.createdAt)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-500 hidden md:table-cell">{inv.items?.length || 0}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(inv.total)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hidden sm:table-cell">{formatCurrency(inv.paid)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <Badge variant={statusColors[inv.status] || "default"} className="text-[10px] sm:text-xs">{inv.status}</Badge>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card><CardContent className="p-6"><p className="text-sm text-slate-400 text-center py-4">Filtered pending invoices view</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="paid">
          <Card><CardContent className="p-6"><p className="text-sm text-slate-400 text-center py-4">Filtered paid invoices view</p></CardContent></Card>
        </TabsContent>
        <TabsContent value="overdue">
          <Card><CardContent className="p-6"><p className="text-sm text-slate-400 text-center py-4">Filtered overdue invoices view</p></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
