import { describe, expect, test } from "bun:test";
import type { Property, Renter } from "shared";

import type { LeaseWithNames } from "@/lib/services/leases";
import type { MaintenanceRequestWithNames } from "@/lib/services/maintenance";
import type { PaymentWithNames } from "@/lib/services/payments";
import { summarizeDashboard, type DashboardData } from "./stats";

// Only the fields summarizeDashboard reads; the rest of each row is irrelevant here.
const property = (id: string) => ({ id }) as Property;
const renter = (id: string) => ({ id }) as Renter;
const lease = (id: string, propertyId: string, renterId: string, status: string, monthlyRent: string) =>
  ({ id, propertyId, renterId, status, monthlyRent }) as LeaseWithNames;
const payment = (id: string, status: string, amount: string, dueDate: string, paidDate: string | null = null) =>
  ({ id, status, amount, dueDate, paidDate }) as PaymentWithNames;
const request = (id: string, propertyId: string, status: string, priority: string, reportedDate: string) =>
  ({ id, propertyId, status, priority, reportedDate }) as MaintenanceRequestWithNames;

const empty: DashboardData = { properties: [], renters: [], leases: [], payments: [], maintenance: [] };

describe("summarizeDashboard", () => {
  test("an empty account is all zeros, with no division by zero", () => {
    const summary = summarizeDashboard(empty);

    expect(summary).toMatchObject({
      totalProperties: 0, totalRenters: 0, rentersWithActiveLease: 0, monthlyRent: 0, activeLeases: 0,
      pendingPayments: 0, pendingAmount: 0, occupied: 0, vacant: 0, withOpenMaintenance: 0, occupancyRate: 0,
    });
    expect(summary.recentPayments).toEqual([]);
    expect(summary.openMaintenance).toEqual([]);
  });

  test("occupancy, renters and rent count only active leases", () => {
    const summary = summarizeDashboard({
      ...empty,
      properties: [property("p1"), property("p2"), property("p3")],
      renters: [renter("r1"), renter("r2"), renter("r3")],
      leases: [
        lease("l1", "p1", "r1", "active", "800.00"),
        lease("l2", "p1", "r2", "active", "100.50"), // second active lease on p1: p1 still counts once
        lease("l3", "p2", "r1", "expired", "999.00"),
        lease("l4", "p3", "r3", "pending", "500.00"),
      ],
    });

    expect(summary).toMatchObject({
      totalProperties: 3, occupied: 1, vacant: 2, occupancyRate: 33,
      totalRenters: 3, rentersWithActiveLease: 2, activeLeases: 2, monthlyRent: 900.5,
    });
  });

  test("occupancy is rounded to a whole percentage", () => {
    const summary = summarizeDashboard({
      ...empty,
      properties: [property("p1"), property("p2"), property("p3")],
      leases: [lease("l1", "p1", "r1", "active", "1"), lease("l2", "p2", "r1", "active", "1")],
    });

    expect(summary.occupancyRate).toBe(67);
  });

  test("pending payments are pending plus overdue, with their amount", () => {
    const summary = summarizeDashboard({
      ...empty,
      payments: [
        payment("a", "paid", "800.00", "2026-11-05", "2026-11-04"),
        payment("b", "pending", "600.00", "2026-11-10"),
        payment("c", "overdue", "300.50", "2026-10-10"),
        payment("d", "partial", "50.00", "2026-09-10", "2026-09-12"),
      ],
    });

    expect(summary.pendingPayments).toBe(2);
    expect(summary.pendingAmount).toBe(900.5);
  });

  test("recent payments are ordered by paid date, else due date, and capped at 5", () => {
    const summary = summarizeDashboard({
      ...empty,
      payments: [
        payment("old-due", "overdue", "1", "2026-01-10"),
        payment("paid-late", "paid", "1", "2026-03-01", "2026-11-20"),
        payment("due-nov", "pending", "1", "2026-11-10"),
        payment("paid-early", "paid", "1", "2026-11-30", "2026-11-01"),
        payment("due-feb", "pending", "1", "2026-02-10"),
        payment("due-mar", "pending", "1", "2026-03-10"),
      ],
    });

    expect(summary.recentPayments.map((p) => p.id)).toEqual(["paid-late", "due-nov", "paid-early", "due-mar", "due-feb"]);
  });

  test("open maintenance excludes completed and closed, most urgent first, then most recent", () => {
    const summary = summarizeDashboard({
      ...empty,
      maintenance: [
        request("low", "p1", "open", "low", "2026-11-09T00:00:00.000Z"),
        request("urgent-old", "p2", "in_progress", "urgent", "2026-10-01T00:00:00.000Z"),
        request("urgent-new", "p1", "open", "urgent", "2026-11-01T00:00:00.000Z"),
        request("done", "p3", "completed", "urgent", "2026-11-10T00:00:00.000Z"),
        request("closed", "p3", "closed", "high", "2026-11-10T00:00:00.000Z"),
        request("high", "p1", "open", "high", "2026-11-05T00:00:00.000Z"),
      ],
    });

    expect(summary.openMaintenance.map((m) => m.id)).toEqual(["urgent-new", "urgent-old", "high", "low"]);
    expect(summary.withOpenMaintenance).toBe(2);
  });
});
