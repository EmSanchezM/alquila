import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, DollarSign, AlertTriangle } from "lucide-react"
import { FC } from "react"

import { formatMoney } from "@/lib/utils/format"
import type { DashboardSummary } from "@/features/dashboard/stats"

interface StatsOverviewProps {
  summary: DashboardSummary
}

const StatsOverview: FC<StatsOverviewProps> = ({ summary }) => {
  const cards = [
    { title: "Total Properties", value: String(summary.totalProperties), note: `${summary.occupied} occupied, ${summary.vacant} vacant`, icon: Building2 },
    { title: "Active Renters", value: String(summary.rentersWithActiveLease), note: `${summary.totalRenters} renters in total`, icon: Users },
    { title: "Monthly Rent", value: formatMoney(summary.monthlyRent), note: `From ${summary.activeLeases} active leases`, icon: DollarSign },
    { title: "Pending Payments", value: String(summary.pendingPayments), note: `${formatMoney(summary.pendingAmount)} pending or overdue`, icon: AlertTriangle },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map(({ title, value, note, icon: Icon }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default StatsOverview
