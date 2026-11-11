import { Link } from "@tanstack/react-router"
import { Building2, Users, DollarSign, Wrench } from "lucide-react"

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const actions = [
  { to: "/renters/create", label: "Add Renter", icon: Users, primary: true },
  { to: "/properties/create", label: "Add Property", icon: Building2, primary: false },
  { to: "/payments/create", label: "Record Payment", icon: DollarSign, primary: false },
  { to: "/maintenance/create", label: "New Maintenance", icon: Wrench, primary: false },
] as const

const QuickActions = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map(({ to, label, icon: Icon, primary }) => (
            <Button
              key={to}
              variant={primary ? "default" : "outline"}
              className={`h-20 flex flex-col space-y-2 ${primary ? "" : "bg-transparent"}`}
              asChild
            >
              <Link to={to}>
                <Icon className="h-6 w-6" />
                <span>{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickActions
