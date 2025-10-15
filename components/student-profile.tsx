"use client"

import { User, Mail, Phone, MapPin, Calendar, GraduationCap, BookOpen, Award, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRegistrationStore } from "@/lib/registration-store"

export function StudentProfile() {
  const { completedCourses, getTotalCredits } = useRegistrationStore()

  // Mock student data
  const studentData = {
    id: "202301234",
    name: "Ahmed Al-Mansour",
    email: "ahmed.almansour@pmu.edu.sa",
    phone: "+966 50 123 4567",
    address: "Al Khobar, Eastern Province",
    major: "Software Engineering",
    minor: "Data Science",
    enrollmentDate: "Fall 2023",
    expectedGraduation: "Spring 2027",
    gpa: 3.75,
    completedCredits: 45,
    requiredCredits: 120,
    academicStanding: "Good Standing",
  }

  const currentCredits = getTotalCredits()
  const totalCredits = studentData.completedCredits + currentCredits
  const progressPercentage = (totalCredits / studentData.requiredCredits) * 100

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Profile</h1>
          <p className="text-muted-foreground">View your academic information and progress</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Column - Personal Info */}
          <div className="md:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-1">{studentData.name}</h2>
                <p className="text-sm text-muted-foreground mb-2">Student ID: {studentData.id}</p>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {studentData.academicStanding}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground">{studentData.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground">{studentData.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm text-foreground">{studentData.address}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Academic Info Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Major</p>
                  <p className="text-sm font-medium text-foreground">{studentData.major}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Minor</p>
                  <p className="text-sm font-medium text-foreground">{studentData.minor}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Enrollment Date</p>
                  <p className="text-sm font-medium text-foreground">{studentData.enrollmentDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Expected Graduation</p>
                  <p className="text-sm font-medium text-foreground">{studentData.expectedGraduation}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Academic Progress */}
          <div className="md:col-span-2 space-y-6">
            {/* GPA Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Award className="h-5 w-5" />
                Academic Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">{studentData.gpa}</div>
                  <p className="text-sm text-muted-foreground">Cumulative GPA</p>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">{totalCredits}</div>
                  <p className="text-sm text-muted-foreground">Total Credits</p>
                </div>
                <div className="text-center p-4 bg-accent/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {studentData.requiredCredits - totalCredits}
                  </div>
                  <p className="text-sm text-muted-foreground">Credits Remaining</p>
                </div>
              </div>
            </Card>

            {/* Degree Progress Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Degree Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Overall Progress</span>
                    <span className="text-sm font-medium text-foreground">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {totalCredits} of {studentData.requiredCredits} credits completed
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-700">{studentData.completedCredits}</p>
                    <p className="text-xs text-green-600">credits</p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">In Progress</p>
                    <p className="text-2xl font-bold text-blue-700">{currentCredits}</p>
                    <p className="text-xs text-blue-600">credits</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Completed Courses Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Completed Courses
              </h3>
              {completedCourses.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {completedCourses.map((courseCode) => (
                    <div key={courseCode} className="p-3 bg-accent/50 rounded-lg border border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium text-foreground">{courseCode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No completed courses yet</p>
              )}
            </Card>

            {/* Academic Timeline Card */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Academic Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div className="w-0.5 h-full bg-border"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-foreground">Fall 2023</p>
                    <p className="text-xs text-muted-foreground">Started Software Engineering Program</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div className="w-0.5 h-full bg-border"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-foreground">Spring 2024</p>
                    <p className="text-xs text-muted-foreground">Completed Foundation Courses</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                    <div className="w-0.5 h-full bg-border"></div>
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-foreground">Fall 2024</p>
                    <p className="text-xs text-muted-foreground">Declared Data Science Minor</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Spring 2027</p>
                    <p className="text-xs text-muted-foreground">Expected Graduation</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
