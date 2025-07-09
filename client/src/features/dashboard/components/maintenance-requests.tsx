import { FC } from "react"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Wrench } from "lucide-react"

interface MaintenanceRequestsProps {
  maintenanceRequests: {
    id: number
    property: string
    issue: string
    priority: string
    status: string
  }[]
}

const MaintenanceRequests: FC<MaintenanceRequestsProps> = ({ maintenanceRequests }) => {
  return (
    <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
          <CardDescription>Active maintenance issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {request.status === "completed" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : request.status === "in_progress" ? (
                    <Clock className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Wrench className="h-5 w-5 text-orange-500" />
                  )}
                  <div>
                    <p className="font-medium">{request.issue}</p>
                    <p className="text-sm text-muted-foreground">{request.property}</p>
                  </div>
                </div>
                <Badge
                  variant={
                    request.priority === "urgent"
                      ? "destructive"
                      : request.priority === "high"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {request.priority}
                </Badge>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4 bg-transparent">
            View All Requests
          </Button>
        </CardContent>
      </Card>
  )
}

export default MaintenanceRequests