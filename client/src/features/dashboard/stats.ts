import type { Property, Renter } from "shared"

import type { LeaseWithNames } from "@/lib/services/leases"
import type { MaintenanceRequestWithNames } from "@/lib/services/maintenance"
import type { PaymentWithNames } from "@/lib/services/payments"

export interface DashboardData {
  properties: Property[]
  renters: Renter[]
  leases: LeaseWithNames[]
  payments: PaymentWithNames[]
  maintenance: MaintenanceRequestWithNames[]
}

export interface DashboardSummary {
  totalProperties: number
  totalRenters: number
  rentersWithActiveLease: number
  monthlyRent: number
  activeLeases: number
  pendingPayments: number
  pendingAmount: number
  occupied: number
  vacant: number
  withOpenMaintenance: number
  occupancyRate: number
  recentPayments: PaymentWithNames[]
  openMaintenance: MaintenanceRequestWithNames[]
}

const LIMIT = 5
const isOpen = (status: string) => status === "open" || status === "in_progress"
const priorityRank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 }

/** Everything the dashboard shows, derived from the API lists. Pure, so it is easy to reason about. */
export function summarizeDashboard({ properties, renters, leases, payments, maintenance }: DashboardData): DashboardSummary {
  const activeLeases = leases.filter((l) => l.status === "active")
  const occupiedIds = new Set(activeLeases.map((l) => l.propertyId))
  const openRequests = maintenance.filter((m) => isOpen(m.status))
  const unpaid = payments.filter((p) => p.status === "pending" || p.status === "overdue")
  const occupied = properties.filter((p) => occupiedIds.has(p.id)).length

  return {
    totalProperties: properties.length,
    totalRenters: renters.length,
    rentersWithActiveLease: new Set(activeLeases.map((l) => l.renterId)).size,
    monthlyRent: activeLeases.reduce((sum, l) => sum + Number(l.monthlyRent), 0),
    activeLeases: activeLeases.length,
    pendingPayments: unpaid.length,
    pendingAmount: unpaid.reduce((sum, p) => sum + Number(p.amount), 0),
    occupied,
    vacant: properties.length - occupied,
    withOpenMaintenance: new Set(openRequests.map((m) => m.propertyId)).size,
    occupancyRate: properties.length === 0 ? 0 : Math.round((occupied / properties.length) * 100),
    // Latest activity first: when it was paid, or when it is due.
    recentPayments: [...payments]
      .sort((a, b) => (b.paidDate ?? b.dueDate).localeCompare(a.paidDate ?? a.dueDate))
      .slice(0, LIMIT),
    // Most urgent first, then the most recently reported.
    openMaintenance: [...openRequests]
      .sort((a, b) => (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9) || b.reportedDate.localeCompare(a.reportedDate))
      .slice(0, LIMIT),
  }
}
