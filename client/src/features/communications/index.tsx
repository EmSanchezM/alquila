import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { DialogDescription } from "@radix-ui/react-dialog"
import { Link } from "@tanstack/react-router"
import { Edit, Eye, FileText, Mail, MessageCircle, MessageSquare, Plus, Search, Send, Trash2 } from "lucide-react"

export default function CommunicationsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)

  // Mock data - in real app, this would come from your database
  const communications = [
    {
      id: 1,
      tenant: "María García",
      property: "Sunset Apartments - Apt 101",
      type: "email",
      subject: "Monthly Rent Reminder",
      message: "This is a friendly reminder that your rent payment is due on January 1st.",
      status: "sent",
      sentAt: "2025-01-05T10:30:00",
      direction: "outbound",
    },
    {
      id: 2,
      tenant: "Carlos López",
      property: "Ocean View Condo - Apt 205",
      type: "sms",
      subject: "Maintenance Update",
      message: "Your AC repair has been scheduled for tomorrow at 2 PM.",
      status: "delivered",
      sentAt: "2025-01-03T14:15:00",
      direction: "outbound",
    },
    {
      id: 3,
      tenant: "Ana Rodríguez",
      property: "Downtown Loft - Apt 302",
      type: "note",
      subject: "Property Inspection Notes",
      message: "Tenant requested early lease termination. Need to discuss options.",
      status: "internal",
      sentAt: "2024-12-28T09:00:00",
      direction: "internal",
    },
  ]

  const templates = [
    {
      id: 1,
      name: "Payment Reminder",
      type: "email",
      category: "payment_reminder",
      subject: "Rent Payment Due - {{property_name}}",
      content:
        "Dear {{tenant_name}},\n\nThis is a friendly reminder that your rent payment of ${{amount}} is due on {{due_date}}.\n\nPlease ensure payment is made by the due date to avoid any late fees.\n\nThank you,\nProperty Management",
      variables: ["tenant_name", "property_name", "amount", "due_date"],
      isActive: true,
    },
    {
      id: 2,
      name: "Welcome Message",
      type: "email",
      category: "welcome",
      subject: "Welcome to {{property_name}}!",
      content:
        "Dear {{tenant_name}},\n\nWelcome to your new home at {{property_name}}!\n\nWe're excited to have you as our tenant. If you have any questions or concerns, please don't hesitate to contact us.\n\nBest regards,\nProperty Management",
      variables: ["tenant_name", "property_name"],
      isActive: true,
    },
    {
      id: 3,
      name: "Maintenance Notification",
      type: "sms",
      category: "maintenance",
      subject: "Maintenance Update",
      content:
        "Hi {{tenant_name}}, your maintenance request for {{issue}} has been scheduled for {{date}} at {{time}}. Please be available. Thanks!",
      variables: ["tenant_name", "issue", "date", "time"],
      isActive: true,
    },
  ]

  const filteredCommunications = communications.filter((comm) => {
    const matchesSearch =
      comm.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comm.property.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || comm.type === typeFilter
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "sms":
        return <MessageCircle className="h-4 w-4" />
      case "note":
        return <FileText className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return "default"
      case "failed":
        return "destructive"
      case "internal":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/renters" className="text-blue-600 hover:text-blue-800">
                ← Back to Tenants
              </Link>
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Communications</h1>
              </div>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send New Message</DialogTitle>
                    <DialogDescription>Send a message to one or more tenants</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select tenant" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="maria">María García</SelectItem>
                            <SelectItem value="carlos">Carlos López</SelectItem>
                            <SelectItem value="ana">Ana Rodríguez</SelectItem>
                            <SelectItem value="all">All Tenants</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Message Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="note">Internal Note</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template">Use Template (Optional)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Template</SelectItem>
                          <SelectItem value="payment">Payment Reminder</SelectItem>
                          <SelectItem value="welcome">Welcome Message</SelectItem>
                          <SelectItem value="maintenance">Maintenance Notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Message subject" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Type your message here..." rows={6} />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsMessageDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsMessageDialogOpen(false)}>Send Message</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Communication History</TabsTrigger>
            <TabsTrigger value="templates">Message Templates</TabsTrigger>
          </TabsList>

          {/* Communication History */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Communication History</CardTitle>
                <CardDescription>All messages, emails, and notes sent to tenants</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search communications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="note">Notes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Communications Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommunications.map((comm) => (
                      <TableRow key={comm.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(comm.type)}
                            <span className="capitalize">{comm.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{comm.tenant}</p>
                            <p className="text-sm text-gray-500">{comm.property}</p>
                          </div>
                        </TableCell>
                        <TableCell>{comm.subject}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(comm.status)}>{comm.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(comm.sentAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {comm.type !== "note" && (
                              <Button size="sm" variant="ghost">
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Message Templates */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Message Templates</CardTitle>
                    <CardDescription>Pre-configured message templates for common communications</CardDescription>
                  </div>
                  <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Message Template</DialogTitle>
                        <DialogDescription>Create a reusable template for common messages</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="template-name">Template Name</Label>
                            <Input id="template-name" placeholder="Payment Reminder" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="template-type">Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="sms">SMS</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template-category">Category</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="payment_reminder">Payment Reminder</SelectItem>
                              <SelectItem value="welcome">Welcome</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="general">General</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template-subject">Subject</Label>
                          <Input id="template-subject" placeholder="Use {{variables}} for dynamic content" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="template-content">Content</Label>
                          <Textarea
                            id="template-content"
                            placeholder="Use {{tenant_name}}, {{property_name}}, etc. for dynamic content"
                            rows={6}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Available Variables</Label>
                          <div className="flex flex-wrap gap-2">
                            {["tenant_name", "property_name", "amount", "due_date", "date", "time"].map((variable) => (
                              <Badge key={variable} variant="outline">
                                {`{{${variable}}}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setIsTemplateDialogOpen(false)}>Create Template</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {templates.map((template) => (
                    <Card key={template.id} className="border-2">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="flex items-center space-x-2 mt-1">
                              {getTypeIcon(template.type)}
                              <span className="capitalize">{template.type}</span>
                              <Badge variant="outline">{template.category.replace("_", " ")}</Badge>
                            </CardDescription>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-sm font-medium">Subject:</Label>
                            <p className="text-sm text-gray-600 mt-1">{template.subject}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Content Preview:</Label>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                              {template.content.substring(0, 150)}...
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Variables:</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.variables.map((variable) => (
                                <Badge key={variable} variant="secondary" className="text-xs">
                                  {`{{${variable}}}`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button className="w-full mt-4" size="sm">
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}