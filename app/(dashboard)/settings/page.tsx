"use client"

import { motion } from "framer-motion"
import { Bell, Shield, Palette, Globe, Database, Users, Building, CreditCard, Key } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Manage your clinic preferences and configuration.</p>
      </motion.div>

      <Tabs defaultValue="general">
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <TabsList className="w-max sm:w-auto">
            <TabsTrigger value="general"><Palette className="mr-2 h-4 w-4" />General</TabsTrigger>
            <TabsTrigger value="clinic"><Building className="mr-2 h-4 w-4" />Clinic</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
            <TabsTrigger value="security"><Shield className="mr-2 h-4 w-4" />Security</TabsTrigger>
            <TabsTrigger value="team"><Users className="mr-2 h-4 w-4" />Team</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-slate-400">Toggle between light and dark themes.</p>
                </div>
                <ThemeToggle />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Compact Mode</p>
                  <p className="text-xs text-slate-400">Reduce spacing for a denser view.</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Animations</p>
                  <p className="text-xs text-slate-400">Enable smooth transitions and effects.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Language & Region</CardTitle>
              <CardDescription>Set your preferred language and date formats.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <div className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 flex items-center text-sm text-slate-700 dark:text-slate-300">
                    English (US)
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <div className="h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 flex items-center text-sm text-slate-700 dark:text-slate-300">
                    America/New_York
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinic" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Clinic Information</CardTitle>
              <CardDescription>Update your clinic&apos;s profile details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Clinic Name</Label>
                  <Input defaultValue="Main Clinic Downtown" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input defaultValue="+1 (555) 123-4567" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input defaultValue="123 Medical Ave, Downtown" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="downtown@dentalclinic.com" />
              </div>
              <Button>Save Changes</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Branches</CardTitle>
              <CardDescription>Manage your clinic locations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {["Main Clinic Downtown", "Westside Dental Center", "Eastside Family Dental"].map((branch) => (
                  <div key={branch} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{branch}</span>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Appointment Reminders", desc: "Get notified about upcoming appointments." },
                { label: "Low Stock Alerts", desc: "Receive alerts when inventory is low." },
                { label: "Payment Notifications", desc: "Get notified about payments and invoices." },
                { label: "Staff Updates", desc: "Receive updates about staff changes." },
                { label: "System Updates", desc: "Get notified about system updates." },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={item.label !== "System Updates"} />
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-heading">Security Settings</CardTitle>
              <CardDescription>Manage your account security and authentication.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Auth</p>
                  <p className="text-xs text-slate-400">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Session Management</p>
                  <p className="text-xs text-slate-400">View and manage active sessions.</p>
                </div>
                <Button variant="outline" size="sm">Manage</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Change Password</Label>
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
                <Button variant="outline" size="sm">Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-slate-400 text-center py-4">Team management and role-based permissions configuration.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Badge({ variant, children }: { variant: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    success: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  }
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant] || ""}`}>
      {children}
    </span>
  )
}
