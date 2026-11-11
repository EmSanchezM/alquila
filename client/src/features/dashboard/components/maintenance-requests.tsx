import { FC } from "react"
import { Link } from "@tanstack/react-router"

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MaintenancePriorityBadge, MaintenanceStatusBadge } from "@/features/maintenance/components/maintenance-badges"
import type { MaintenanceRequestWithNames } from "@/lib/services/maintenance"

interface MaintenanceRequestsProps {
  maintenanceRequests: MaintenanceRequestWithNames[]
}

const MaintenanceRequests: FC<MaintenanceRequestsProps> = ({ maintenanceRequests }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Requests</CardTitle>
        <CardDescription>Open requests, most urgent first</CardDescription>
      </CardHeader>
      <CardContent>
        {maintenanceRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open maintenance requests.</p>
        ) : (
          <div className="space-y-4">
            {maintenanceRequests.map((request) => (
              <Link
                key={request.id}
                to="/maintenance/$requestId"
                params={{ requestId: request.id }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{request.title}</p>
                  <p className="text-sm text-muted-foreground">{request.propertyName}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <MaintenancePriorityBadge priority={request.priority} />
                  <MaintenanceStatusBadge status={request.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
          <Link to="/maintenance">View All Requests</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default MaintenanceRequests
