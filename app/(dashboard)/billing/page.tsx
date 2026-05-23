"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Download, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"
import { billingApi, patientsApi } from "@/lib/api"

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
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ patientId: "", total: "", dueDate: "", notes: "" })

  useEffect(() => {
    async function loadBilling() {
      try {
        const [invResult, patResult] = await Promise.all([
          billingApi.list({ limit: 100 }),
          patientsApi.list({ limit: 200 }),
        ])
        setInvoices(invResult.data)
        setPatients(patResult.data)
      } catch (err) {
        console.error("Failed to load billing data:", err)
      } finally {
        setLoading(false)
      }
    }
    loadBilling()
  }, [])

  async function handleCreateInvoice(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await billingApi.create({
        patientId: form.patientId,
        total: parseFloat(form.total),
        dueDate: form.dueDate,
        notes: form.notes,
        subtotal: parseFloat(form.total),
        tax: 0,
        discount: 0,
        paid: 0,
        status: "pending",
      })
      setDialogOpen(false)
      setForm({ patientId: "", total: "", dueDate: "", notes: "" })
      const result = await billingApi.list({ limit: 100 })
      setInvoices(result.data)
    } catch (err: any) {
      console.error("Failed to create invoice:", err)
    } finally {
      setSaving(false)
    }
  }

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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 sm:h-10">
                <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Invoice</DialogTitle>
                <DialogDescription>Create a new invoice for a patient.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Patient</Label>
                  <select className="flex h-9 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 text-sm" required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
                    <option value="">Select patient</option>
                    {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Total amount ($)</Label>
                  <Input type="number" step="0.01" min="0" required value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Due date</Label>
                  <Input type="date" required value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Notes (optional)</Label>
                  <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Invoice notes..." />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Invoice"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Total</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Paid</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Status</th>
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
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-slate-900 dark:text-white">{formatCurrency(inv.total)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 hidden sm:table-cell">{formatCurrency(inv.paid)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <Badge variant={statusColors[inv.status] || "default"} className="text-[10px] sm:text-xs">{inv.status}</Badge>
                        </td>
                      </motion.tr>
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
