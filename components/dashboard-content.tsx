import {
  Calendar,
  User,
  BookOpen,
  CreditCard,
  FileText,
  Clock,
  GraduationCap,
  Receipt,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const services = [
  {
    icon: Calendar,
    title: "Attendance Tracking",
    description: "View your attendance records and statistics",
    color: "text-pmu-blue",
  },
  {
    icon: User,
    title: "Student Profile",
    description: "Update your personal information",
    color: "text-pmu-gold",
  },
  {
    icon: BookOpen,
    title: "Class List",
    description: "View your registered courses",
    color: "text-pmu-blue",
  },
  {
    icon: CreditCard,
    title: "Account Summary",
    description: "Check your financial status",
    color: "text-pmu-gold",
  },
  {
    icon: Receipt,
    title: "Payment History",
    description: "View past transactions",
    color: "text-pmu-blue",
  },
  {
    icon: Clock,
    title: "Class Schedule",
    description: "View your weekly schedule",
    color: "text-pmu-gold",
  },
  {
    icon: GraduationCap,
    title: "Academic Progress",
    description: "Track your degree completion",
    color: "text-pmu-blue",
  },
  {
    icon: FileText,
    title: "Transcripts",
    description: "Request official transcripts",
    color: "text-pmu-gold",
  },
]

const alerts = [
  {
    type: "warning",
    message: "Registration for Spring 2025 opens on December 15th",
  },
  {
    type: "info",
    message: "Final exam schedule is now available",
  },
]

export function DashboardContent() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Student Services</h1>
        <p className="text-muted-foreground">Welcome back! Access your academic services below.</p>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                alert.type === "warning"
                  ? "bg-pmu-gold/10 border-pmu-gold/30 text-pmu-gold-dark"
                  : "bg-pmu-blue/10 border-pmu-blue/30 text-pmu-blue"
              }`}
            >
              {alert.type === "warning" ? (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {services.map((service) => {
          const Icon = service.icon
          return (
            <Card key={service.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2.5 rounded-lg bg-secondary ${service.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                <Button variant="link" className="px-0 mt-2 h-auto text-sm font-medium">
                  Access →
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current GPA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">3.75</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 4.00</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">87</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 120 required</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$0.00</div>
            <p className="text-xs text-pmu-gold mt-1 font-medium">Account is clear</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
