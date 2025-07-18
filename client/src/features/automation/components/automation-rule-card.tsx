import { FC } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

interface Trigger {
  type: string
  value: number
  action: string
}

interface AutomationRule {
  id: number
  name: string
  description: string
  isActive: boolean
  triggers: Trigger[]
  appliedTo: string
  lastModified: string
  totalTenants: number
  activeReminders: number
}

interface AutomationRuleCardProps {
  rule: AutomationRule
}

const AutomationRuleCard: FC<AutomationRuleCardProps> = ({ rule }) => {
  return (
    <Card key={rule.id}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <span>{rule.name}</span>
              <Badge variant={rule.isActive ? "default" : "secondary"}>
                {rule.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
            <CardDescription>{rule.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={rule.isActive} />
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Trigger Schedule</h4>
            <div className="space-y-2">
              {rule.triggers.map((trigger, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>
                    {trigger.value} {trigger.type.replace("_", " ")} → {trigger.action.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-blue-600">{rule.totalTenants}</p>
                <p className="text-sm text-gray-500">Total Renters</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{rule.activeReminders}</p>
                <p className="text-sm text-gray-500">Active Reminders</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Last modified: {new Date(rule.lastModified).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AutomationRuleCard;