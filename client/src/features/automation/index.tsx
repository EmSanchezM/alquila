import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Clock,
  Mail,
  MessageSquare,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Play,
  Edit,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Link } from "@tanstack/react-router"
import AutomationRuleCard from "./components/automation-rule-card"

export default function PaymentAutomationPage() {
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)

  // Mock data for automation rules
  const automationRules = [
    {
      id: 1,
      name: "Standard Payment Reminders",
      description: "Default reminder sequence for all renters",
      isActive: true,
      triggers: [
        { type: "days_before", value: 7, action: "email_reminder" },
        { type: "days_before", value: 3, action: "sms_reminder" },
        { type: "days_before", value: 1, action: "final_reminder" },
        { type: "days_after", value: 1, action: "overdue_notice" },
      ],
      appliedTo: "all_renters",
      lastModified: "2025-01-05",
      totalTenants: 28,
      activeReminders: 15,
    },
    {
      id: 2,
      name: "High-Risk Renter Reminders",
      description: "Enhanced reminders for renters with payment history issues",
      isActive: true,
      triggers: [
        { type: "days_before", value: 14, action: "early_reminder" },
        { type: "days_before", value: 7, action: "email_reminder" },
        { type: "days_before", value: 3, action: "sms_reminder" },
        { type: "days_before", value: 1, action: "phone_call_reminder" },
        { type: "days_after", value: 1, action: "overdue_notice" },
        { type: "days_after", value: 5, action: "legal_notice" },
      ],
      appliedTo: "high_risk",
      lastModified: "2025-01-03",
      totalTenants: 3,
      activeReminders: 8,
    },
  ]

  // Mock data for scheduled reminders
  const scheduledReminders = [
    {
      id: 1,
      tenant: "María García",
      property: "Sunset Apartments - Apt 101",
      type: "first_reminder",
      method: "email",
      scheduledDate: "2025-01-25",
      dueDate: "2025-02-01",
      amount: 1200,
      status: "scheduled",
      rule: "Standard Payment Reminders",
    },
    {
      id: 2,
      tenant: "Carlos López",
      property: "Ocean View Condo - Apt 205",
      type: "overdue_notice",
      method: "sms",
      scheduledDate: "2025-01-09",
      dueDate: "2025-01-01",
      amount: 1800,
      status: "sent",
      rule: "High-Risk Renter Reminders",
    },
    {
      id: 3,
      tenant: "Ana Rodríguez",
      property: "Downtown Loft - Apt 302",
      type: "legal_notice",
      method: "email",
      scheduledDate: "2025-01-10",
      dueDate: "2024-12-01",
      amount: 1500,
      status: "pending",
      rule: "High-Risk Renter Reminders",
    },
  ]

  // Mock data for automation statistics
  const stats = {
    totalRules: 2,
    activeRules: 2,
    scheduledReminders: 15,
    sentThisMonth: 42,
    responseRate: 78,
    collectionImprovement: 15,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "pending":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "sms":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/payments" className="text-blue-600 hover:text-blue-800">
                ← Back to Payments
              </Link>
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Payment Automation</h1>
              </div>
            </div>
            <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  New Automation Rule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Automation Rule</DialogTitle>
                  <DialogDescription>Set up automated payment reminders and actions</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rule-name">Rule Name</Label>
                      <Input id="rule-name" placeholder="Standard Payment Reminders" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apply-to">Apply To</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select renters" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Renters</SelectItem>
                          <SelectItem value="high_risk">High Risk Renters</SelectItem>
                          <SelectItem value="new_tenants">New Renters</SelectItem>
                          <SelectItem value="custom">Custom Selection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Label>Reminder Schedule</Label>
                    <div className="space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        <Input type="number" placeholder="7" />
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="days before" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days_before">days before</SelectItem>
                            <SelectItem value="days_after">days after</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email Reminder</SelectItem>
                            <SelectItem value="sms">SMS Reminder</SelectItem>
                            <SelectItem value="both">Email + SMS</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsRuleDialogOpen(false)}>Create Rule</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRules}</div>
              <p className="text-xs text-muted-foreground">of {stats.totalRules} total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduledReminders}</div>
              <p className="text-xs text-muted-foreground">upcoming reminders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent This Month</CardTitle>
              <Mail className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.sentThisMonth}</div>
              <p className="text-xs text-muted-foreground">automated messages</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.responseRate}%</div>
              <p className="text-xs text-muted-foreground">payment response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+{stats.collectionImprovement}%</div>
              <p className="text-xs text-muted-foreground">improvement</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Renters</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">automated</p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="rules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rules">Automation Rules</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reminders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          {/* Automation Rules */}
          <TabsContent value="rules">
            <div className="space-y-6">
              {automationRules.map((rule) => (
                <AutomationRuleCard rule={rule} />
              ))}
            </div>
          </TabsContent>

          {/* Scheduled Reminders */}
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Reminders</CardTitle>
                <CardDescription>Upcoming automated payment reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Renter</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scheduledReminders.map((reminder) => (
                      <TableRow key={reminder.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reminder.tenant}</p>
                            <p className="text-sm text-gray-500">{reminder.property}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{reminder.type.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getMethodIcon(reminder.method)}
                            <span className="capitalize">{reminder.method}</span>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(reminder.scheduledDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(reminder.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>${reminder.amount}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(reminder.status)}
                            <Badge variant={reminder.status === "sent" ? "default" : "secondary"}>
                              {reminder.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {reminder.status === "scheduled" && (
                              <Button size="sm" variant="outline">
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reminder Effectiveness</CardTitle>
                  <CardDescription>Response rates by reminder type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>First Reminder</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                        </div>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Second Reminder</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                        </div>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Final Reminder</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "58%" }}></div>
                        </div>
                        <span className="text-sm font-medium">58%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Overdue Notice</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-red-600 h-2 rounded-full" style={{ width: "35%" }}></div>
                        </div>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Collection Improvement</CardTitle>
                  <CardDescription>Before vs after automation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-600">72%</p>
                        <p className="text-sm text-gray-500">Before Automation</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-600">87%</p>
                        <p className="text-sm text-gray-500">After Automation</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">+15%</p>
                      <p className="text-sm text-gray-500">Collection Rate Improvement</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}