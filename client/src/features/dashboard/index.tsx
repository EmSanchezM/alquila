import { useQueries } from "@tanstack/react-query"

import { LoadErrorState, LoadingState } from "@/components/shared/resource-states"
import { getAllLeasesQueryOptions } from "@/lib/services/leases"
import { getAllMaintenanceRequestsQueryOptions } from "@/lib/services/maintenance"
import { getAllPaymentsQueryOptions } from "@/lib/services/payments"
import { getAllPropertiesQueryOptions } from "@/lib/services/properties"
import { getAllRentersQueryOptions } from "@/lib/services/renters"
import StatsOverview from "./components/stats-overview"
import QuickActions from "./components/quick-actions"
import RecentPayments from "./components/recent-payments"
import MaintenanceRequests from "./components/maintenance-requests"
import OccupancyOverview from "./components/occupancy-overview"
import { summarizeDashboard } from "./stats"

export default function Dashboard() {
  // The list queries are shared with the module pages, so their caches stay in sync.
  const [properties, renters, leases, payments, maintenance] = useQueries({
    queries: [
      getAllPropertiesQueryOptions,
      getAllRentersQueryOptions,
      getAllLeasesQueryOptions,
      getAllPaymentsQueryOptions,
      getAllMaintenanceRequestsQueryOptions,
    ],
  })
  const all = [properties, renters, leases, payments, maintenance]

  if (all.some((q) => q.isLoading)) {
    return <LoadingState>Loading dashboard...</LoadingState>
  }

  // A failed background refetch keeps the previous data: only a query with nothing to show blocks the page.
  const failed = all.filter((q) => q.error)
  const retry = () => failed.forEach((q) => q.refetch())

  if (failed.some((q) => !q.data)) {
    return <LoadErrorState message="Failed to load the dashboard." onRetry={retry} />
  }

  const summary = summarizeDashboard({
    properties: properties.data ?? [],
    renters: renters.data ?? [],
    leases: leases.data ?? [],
    payments: payments.data ?? [],
    maintenance: maintenance.data ?? [],
  })

  return (
    <>
    {failed.length > 0 && <LoadErrorState message="Some data could not be refreshed. Showing the last loaded values." onRetry={retry} />}

    {/* Stats Overview */}
    <StatsOverview summary={summary} />

    {/* Quick Actions */}
    <QuickActions />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Payments */}
      <RecentPayments recentPayments={summary.recentPayments} />
      {/* Maintenance Requests */}
      <MaintenanceRequests maintenanceRequests={summary.openMaintenance} />
    </div>
    {/* Occupancy Overview */}
    <OccupancyOverview summary={summary} />
    </>
  )
}
