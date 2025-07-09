import { FC } from "react"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface OccupancyOverviewProps {
  stats: {
    totalProperties: number
    totalTenants: number
    monthlyRevenue: number
    pendingPayments: number
    maintenanceRequests: number
    occupancyRate: number
  }
}

const OccupancyOverview: FC<OccupancyOverviewProps> = ({ stats }) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Occupancy Overview</CardTitle>
        <CardDescription>Current occupancy rate across all properties</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Overall Occupancy</span>
            <span className="font-medium">{stats.occupancyRate}%</span>
          </div>
          <Progress value={stats.occupancyRate} className="w-full" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">26</p>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">2</p>
              <p className="text-sm text-muted-foreground">Vacant</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">1</p>
              <p className="text-sm text-muted-foreground">Maintenance</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OccupancyOverview