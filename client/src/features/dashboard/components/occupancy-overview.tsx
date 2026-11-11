import { FC } from "react"
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

import type { DashboardSummary } from "@/features/dashboard/stats"

interface OccupancyOverviewProps {
  summary: DashboardSummary
}

const OccupancyOverview: FC<OccupancyOverviewProps> = ({ summary }) => {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Occupancy Overview</CardTitle>
        <CardDescription>Properties with an active lease</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Overall Occupancy</span>
            <span className="font-medium">{summary.occupancyRate}%</span>
          </div>
          <Progress value={summary.occupancyRate} className="w-full" aria-label="Overall occupancy" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{summary.occupied}</p>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{summary.vacant}</p>
              <p className="text-sm text-muted-foreground">Vacant</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{summary.withOpenMaintenance}</p>
              <p className="text-sm text-muted-foreground">With open maintenance</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OccupancyOverview
