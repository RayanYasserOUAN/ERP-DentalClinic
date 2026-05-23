"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Plus, Search, AlertTriangle, Package, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency, cn } from "@/lib/utils"
import { inventoryApi } from "@/lib/api"

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInventory() {
      try {
        const result = await inventoryApi.list({ limit: 100 })
        setItems(result.data)
      } catch (err) {
        console.error("Failed to load inventory:", err)
      } finally {
        setLoading(false)
      }
    }
    loadInventory()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  const lowStock = items.filter((i: any) => i.quantity <= i.minQuantity)
  const totalValue = items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">Inventory</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Track supplies, materials, and equipment.</p>
        </div>
        <Button size="default" className="h-9 sm:h-10 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Items</p>
              <p className="text-xl font-bold font-heading text-slate-900 dark:text-white">{items.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Low Stock</p>
              <p className="text-xl font-bold font-heading text-amber-600 dark:text-amber-400">{lowStock.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Value</p>
            <p className="text-xl font-bold font-heading text-slate-900 dark:text-white">{formatCurrency(totalValue)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative flex-1 min-w-[160px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search inventory..." className="pl-10 h-9 sm:h-10" />
        </div>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm">Category</Button>
        <Button variant="outline" size="sm" className="text-xs sm:text-sm">Supplier</Button>
      </div>

      <Tabs defaultValue="all">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <TabsList className="w-max sm:w-auto">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="low">Low Stock</TabsTrigger>
            <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Item</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">SKU</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Category</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Qty</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Min</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">Price</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4 hidden lg:table-cell">Supplier</th>
                      <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider px-3 sm:px-6 py-3 sm:py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: any, i: number) => (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-mono text-slate-500 hidden md:table-cell">{item.sku}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                          <Badge variant="default" className="text-[10px] sm:text-xs">{item.category}</Badge>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={cn("text-sm font-medium", item.quantity <= item.minQuantity ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300")}>
                            {item.quantity}
                          </span>
                          <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-500 hidden sm:table-cell">{item.minQuantity}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-900 dark:text-white hidden sm:table-cell">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm text-slate-500 hidden lg:table-cell">{item.supplier || "-"}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          {item.quantity <= item.minQuantity ? (
                            <Badge variant="destructive" className="text-[10px] sm:text-xs">Low Stock</Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px] sm:text-xs">In Stock</Badge>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="low" className="mt-4">
          <Card>
            <CardContent className="p-6">
              {lowStock.length > 0 ? (
                <div className="grid gap-3">
                  {lowStock.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-rose-500" />
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">Stock: {item.quantity} {item.unit} (min: {item.minQuantity})</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Order</Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No low stock items.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 text-center py-4">Items expiring soon will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
