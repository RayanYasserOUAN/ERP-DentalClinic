"use client"

import { motion } from "framer-motion"
import { Download, BarChart3, TrendingUp, Users, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getMonthlyRevenue } from "@/lib/data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"

const procedureData = [
  { name: "Check-up", value: 45 },
  { name: "Cleaning", value: 30 },
  { name: "Filling", value: 20 },
  { name: "Root Canal", value: 12 },
  { name: "Extraction", value: 8 },
  { name: "Crown", value: 6 },
]

const COLORS = ["#14b8a6", "#0ea5e9", "#f59e0b", "#f43f5e", "#8b5cf6", "#10b981"]

const dentistPerformance = [
  { name: "Dr. White", patients: 89, revenue: 28500, rating: 4.9 },
  { name: "Dr. Lee", patients: 72, revenue: 32100, rating: 4.8 },
  { name: "Dr. Park", patients: 56, revenue: 19800, rating: 4.7 },
  { name: "Dr. Adams", patients: 34, revenue: 12200, rating: 4.5 },
]

export default function ReportsPage() {
  const revenueData = getMonthlyRevenue()

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Insights and performance metrics for your clinic.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden xs:inline">Export</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">PDF</Button>
          <Button variant="outline" size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">Excel</Button>
        </div>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-4">
        {[
          { label: "Total Appointments", value: "1,247", change: "+12%", icon: Calendar, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
          { label: "Active Patients", value: "584", change: "+8%", icon: Users, color: "text-teal-600 bg-teal-100 dark:bg-teal-900/30" },
          { label: "Avg. Revenue/Patient", value: "$347", change: "+5%", icon: DollarSign, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
          { label: "Growth Rate", value: "23.4%", change: "+3.2%", icon: TrendingUp, color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{stat.label}</p>
                <p className="text-xl font-bold font-heading text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-emerald-500">{stat.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <TabsList className="w-max sm:w-auto">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="procedures">Procedures</TabsTrigger>
            <TabsTrigger value="dentists">Dentists</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue" className="mt-4">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#14b8a6" strokeWidth={2} dot={{ fill: "#14b8a6" }} />
                      <Line type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} dot={{ fill: "#f43f5e" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-heading">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "General Dentistry", value: 45 },
                          { name: "Cosmetic", value: 25 },
                          { name: "Orthodontics", value: 15 },
                          { name: "Oral Surgery", value: 10 },
                          { name: "Other", value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {COLORS.map((color) => (
                          <Cell key={color} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {["General Dentistry", "Cosmetic", "Orthodontics", "Oral Surgery", "Other"].map((name, i) => (
                      <div key={name} className="flex items-center gap-1.5 text-xs">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-500">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="procedures" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Most Common Procedures</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={procedureData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="dark:opacity-20" />
                    <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#14b8a6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dentists" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Dentist Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dentistPerformance.map((d) => (
                  <div key={d.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{d.name}</p>
                      <p className="text-xs text-slate-400">{d.patients} patients · ⭐ {d.rating}</p>
                    </div>
                    <p className="text-lg font-bold font-heading text-emerald-600 dark:text-emerald-400">${d.revenue.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 text-center py-8">
                Patient retention analytics with cohort analysis and churn rates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
