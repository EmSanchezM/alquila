import { Building2, Users, DollarSign, Wrench } from "lucide-react"

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const QuickActions = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex flex-col space-y-2">
            <Users className="h-6 w-6" />
            <span>Add Tenant</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
            <Building2 className="h-6 w-6" />
            <span>Add Property</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
            <DollarSign className="h-6 w-6" />
            <span>Record Payment</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
            <Wrench className="h-6 w-6" />
            <span>New Maintenance</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default QuickActions