import StatsOverview from "./components/stats-overview"
import QuickActions from "./components/quick-actions"
import RecentPayments from "./components/recent-payments"
import MaintenanceRequests from "./components/maintenance-requests"
import OccupancyOverview from "./components/occupancy-overview"

export default function Dashboard() {
  // Mock data - in real app, this would come from your database
  const stats = {
    totalProperties: 12,
    totalTenants: 28,
    monthlyRevenue: 45600,
    pendingPayments: 3,
    maintenanceRequests: 5,
    occupancyRate: 92,
  }

  const recentPayments = [
    { id: 1, tenant: "María García", property: "Apt 101", amount: 1200, status: "paid", date: "2025-01-05" },
    { id: 2, tenant: "Carlos López", property: "Apt 205", amount: 1500, status: "pending", date: "2025-01-08" },
    { id: 3, tenant: "Ana Rodríguez", property: "Apt 302", amount: 1100, status: "overdue", date: "2025-01-01" },
  ]

  const maintenanceRequests = [
    { id: 1, property: "Apt 101", issue: "Faucet leak", priority: "high", status: "open" },
    { id: 2, property: "Apt 205", issue: "AC not working", priority: "urgent", status: "in_progress" },
    { id: 3, property: "Apt 302", issue: "Light bulb replacement", priority: "low", status: "completed" },
  ]

  return (
    <>
    {/* Stats Overview */}
    <StatsOverview stats={stats} />

    {/* Quick Actions */}
    <QuickActions />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Payments */}
      <RecentPayments recentPayments={recentPayments} />
      {/* Maintenance Requests */}
      <MaintenanceRequests maintenanceRequests={maintenanceRequests} />
    </div>
    {/* Occupancy Overview */}
    <OccupancyOverview stats={stats} />
    </>
  )
}
