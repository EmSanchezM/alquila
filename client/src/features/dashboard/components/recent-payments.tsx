import { FC } from "react"
import { Link } from "@tanstack/react-router"

import { Card, CardContent, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PaymentStatusBadge from "@/features/payments/components/payment-status-badge"
import type { PaymentWithNames } from "@/lib/services/payments"
import { formatDay, formatMoney } from "@/lib/utils/format"

interface RecentPaymentsProps {
  recentPayments: PaymentWithNames[]
}

const RecentPayments: FC<RecentPaymentsProps> = ({ recentPayments }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
        <CardDescription>Latest payment activity</CardDescription>
      </CardHeader>
      <CardContent>
        {recentPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
        ) : (
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <Link
                key={payment.id}
                to="/payments/$paymentId"
                params={{ paymentId: payment.id }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{payment.renterName}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.propertyName} · {formatDay(payment.paidDate ?? payment.dueDate)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <p className="font-medium">{formatMoney(payment.amount)}</p>
                  <PaymentStatusBadge status={payment.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
        <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
          <Link to="/payments">View All Payments</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

export default RecentPayments
