"use client"

import { useState, useRef } from "react"
import { MessageCircle, X, Send, Calendar, AlertTriangle, BookOpen, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import coursesData from "@/data/courses.json"
import { useRegistrationStore } from "@/lib/registration-store"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: Date
}

interface Section {
  sectionId: string
  type: "lecture" | "lab"
  instructor: string
  room: string
  days: string
  time: string
}

interface Course {
  code: string
  title: string
  credits: number
  hasLab: boolean
  prereq: string[]
  sections: Section[]
}

const quickActions = [
  {
    icon: Calendar,
    label: "Plan My Schedule",
    prompt: "Help me plan my schedule for next semester",
  },
  {
    icon: AlertTriangle,
    label: "Check Time Conflicts",
    prompt: "Check if my courses have any time conflicts",
  },
  {
    icon: BookOpen,
    label: "Show My Registered Courses",
    prompt: "Show me all my registered courses",
  },
]

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hello! I'm your PMU Registration Assistant. I can help you:\n\n• Browse available courses and sections\n• Register for courses (with confirmation)\n• Auto-register based on credit hours\n• Check prerequisites\n• Plan your schedule\n\nTry asking 'Show me all courses', 'Register me for SOEN2351-01', or 'Register me for 12 credit hours'",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { registeredSections, completedCourses, registerSection, isRegistered } = useRegistrationStore()

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    courseCode: string
    sectionId: string
    courseTitle: string
    sectionDetails: string
    isBulk: boolean
    bulkSections: Array<{ courseCode: string; sectionId: string }>
  }>({
    open: false,
    courseCode: "",
    sectionId: "",
    courseTitle: "",
    sectionDetails: "",
    isBulk: false,
    bulkSections: [],
  })

  const selectCoursesForCredits = (targetCredits: number) => {
    const courses = coursesData.courses as Course[]
    const currentCredits = useRegistrationStore.getState().getTotalCredits()
    const availableCredits = Math.min(18 - currentCredits, targetCredits)

    if (availableCredits <= 0) {
      return {
        success: false,
        message: `You are already at or near the 18 credit limit (current: ${currentCredits} credits). Cannot register for more courses.`,
        selectedSections: [],
      }
    }

    const availableCourses = courses.filter((c) => {
      const hasPrereqs = c.prereq.every((prereq) => completedCourses.includes(prereq))
      const notRegistered = !registeredSections.some((section) => section.courseCode === c.code)
      return hasPrereqs && notRegistered
    })

    if (availableCourses.length === 0) {
      return {
        success: false,
        message: "No available courses found that meet your prerequisites and aren't already registered.",
        selectedSections: [],
      }
    }

    const coursesWithPriority = availableCourses.map((course) => {
      const isPrereqForOthers = courses.some((c) => c.prereq.includes(course.code))
      return { course, priority: isPrereqForOthers ? 1 : 0 }
    })
    coursesWithPriority.sort((a, b) => b.priority - a.priority)

    const selectedSections: Array<{ courseCode: string; sectionId: string; course: Course; section: Section }> = []
    let accumulatedCredits = 0

    for (const { course } of coursesWithPriority) {
      if (accumulatedCredits >= availableCredits) break
      if (accumulatedCredits + course.credits > availableCredits) continue

      const lectureSection = course.sections.find((s) => s.type === "lecture")
      if (!lectureSection) continue

      const hasConflict = selectedSections.some((selected) => {
        const daysOverlap = lectureSection.days.split("").some((day) => selected.section.days.includes(day))
        if (!daysOverlap) return false
        return timeOverlaps(lectureSection.time, selected.section.time)
      })

      if (hasConflict) continue

      selectedSections.push({
        courseCode: course.code,
        sectionId: lectureSection.sectionId,
        course,
        section: lectureSection,
      })
      accumulatedCredits += course.credits

      if (course.hasLab) {
        const labSection = course.sections.find((s) => s.type === "lab")
        if (labSection) {
          const labHasConflict = selectedSections.some((selected) => {
            const daysOverlap = labSection.days.split("").some((day) => selected.section.days.includes(day))
            if (!daysOverlap) return false
            return timeOverlaps(labSection.time, selected.section.time)
          })

          if (!labHasConflict) {
            selectedSections.push({
              courseCode: course.code,
              sectionId: labSection.sectionId,
              course,
              section: labSection,
            })
          }
        }
      }
    }

    if (selectedSections.length === 0) {
      return {
        success: false,
        message: `Could not find courses that fit within ${availableCredits} credits without time conflicts.`,
        selectedSections: [],
      }
    }

    return {
      success: true,
      message: `Found ${selectedSections.length} sections totaling ${accumulatedCredits} credits`,
      selectedSections,
      totalCredits: accumulatedCredits,
    }
  }

  const timeOverlaps = (time1: string, time2: string): boolean => {
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(":").map(Number)
      return hours * 60 + minutes
    }

    const [start1, end1] = time1.split("-")
    const [start2, end2] = time2.split("-")

    const s1 = toMinutes(start1)
    const e1 = toMinutes(end1)
    const s2 = toMinutes(start2)
    const e2 = toMinutes(end2)

    return s1 < e2 && s2 < e1
  }

  const handleRegistrationRequest = (courseCode: string, sectionId: string) => {
    const courses = coursesData.courses as Course[]
    const course = courses.find((c) => c.code === courseCode)

    if (!course) {
      return `❌ Course ${courseCode} not found. Please check the course code and try again.`
    }

    const section = course.sections.find((s) => s.sectionId === sectionId)
    if (!section) {
      return `❌ Section ${sectionId} not found. Please check the section ID and try again.`
    }

    if (isRegistered(sectionId)) {
      return `⚠️ You are already registered for ${sectionId}.`
    }

    const sectionDetails = `${course.code} - ${course.title}\nSection: ${sectionId} (${section.type.toUpperCase()})\nInstructor: ${section.instructor}\nSchedule: ${section.days} ${section.time}\nRoom: ${section.room}\nCredits: ${course.credits}`

    setConfirmDialog({
      open: true,
      courseCode: course.code,
      sectionId: sectionId,
      courseTitle: course.title,
      sectionDetails: sectionDetails,
      isBulk: false,
      bulkSections: [],
    })

    return "CONFIRMATION_PENDING"
  }

  const handleBulkRegistrationRequest = (targetCredits: number) => {
    const result = selectCoursesForCredits(targetCredits)

    if (!result.success) {
      return result.message
    }

    const { selectedSections, totalCredits } = result

    const sectionDetails = selectedSections
      .map((s) => {
        return `• ${s.course.code} - ${s.course.title}\n  Section: ${s.sectionId} (${s.section.type.toUpperCase()})\n  ${s.section.days} ${s.section.time} | ${s.section.room}\n  Instructor: ${s.section.instructor}`
      })
      .join("\n\n")

    const bulkSections = selectedSections.map((s) => ({
      courseCode: s.courseCode,
      sectionId: s.sectionId,
    }))

    setConfirmDialog({
      open: true,
      courseCode: "",
      sectionId: "",
      courseTitle: `${selectedSections.length} Courses (${totalCredits} credits)`,
      sectionDetails: `I've selected the following courses for you:\n\n${sectionDetails}\n\nTotal Credits: ${totalCredits}`,
      isBulk: true,
      bulkSections,
    })

    return "CONFIRMATION_PENDING"
  }

  const handleConfirmedRegistration = () => {
    const { courseCode, sectionId, isBulk, bulkSections } = confirmDialog

    if (isBulk) {
      const results: Array<{ success: boolean; message: string }> = []

      for (const section of bulkSections) {
        const result = registerSection(section.courseCode, section.sectionId)
        results.push(result)
      }

      const successCount = results.filter((r) => r.success).length
      const failCount = results.length - successCount

      setConfirmDialog({
        open: false,
        courseCode: "",
        sectionId: "",
        courseTitle: "",
        sectionDetails: "",
        isBulk: false,
        bulkSections: [],
      })

      const botMessage: Message = {
        id: Date.now().toString(),
        type: "bot",
        content:
          successCount > 0
            ? `✅ Successfully registered for ${successCount} section(s)!${failCount > 0 ? `\n⚠️ ${failCount} section(s) could not be registered.` : ""}\n\nYou can view your schedule by clicking "My Schedule" in the sidebar or asking "Show my registered courses".`
            : `❌ Could not register for any sections. Please check your prerequisites and schedule conflicts.`,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      return
    }

    const result = registerSection(courseCode, sectionId)

    setConfirmDialog({
      open: false,
      courseCode: "",
      sectionId: "",
      courseTitle: "",
      sectionDetails: "",
      isBulk: false,
      bulkSections: [],
    })

    const botMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content: result.success
        ? `✅ ${result.message}\n\nYou can view your schedule by clicking "My Schedule" in the sidebar or asking "Show my registered courses".`
        : `❌ ${result.message}`,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, botMessage])
  }

  const handleCancelledRegistration = () => {
    setConfirmDialog({
      open: false,
      courseCode: "",
      sectionId: "",
      courseTitle: "",
      sectionDetails: "",
      isBulk: false,
      bulkSections: [],
    })

    const botMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content: "Registration cancelled. Let me know if you'd like to register for different courses!",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, botMessage])
  }

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    setTimeout(() => {
      let botResponse = ""
      const lowerContent = content.toLowerCase()
      const courses = coursesData.courses as Course[]

      if (
        lowerContent.includes("register") &&
        (lowerContent.includes("credit") || lowerContent.includes("hour")) &&
        lowerContent.match(/\d+/)
      ) {
        const creditsMatch = content.match(/(\d+)/)
        if (creditsMatch) {
          const targetCredits = Number.parseInt(creditsMatch[1])
          if (targetCredits > 0 && targetCredits <= 18) {
            botResponse = handleBulkRegistrationRequest(targetCredits)

            if (botResponse === "CONFIRMATION_PENDING") {
              setIsTyping(false)
              return
            }
          } else {
            botResponse = "❌ Please specify a valid number of credit hours between 1 and 18."
          }
        }
      } else if (lowerContent.includes("register") && lowerContent.match(/[a-z]+\d+-\w+/i)) {
        const sectionMatch = content.match(/([A-Z]+\d+-\w+)/i)
        if (sectionMatch) {
          const sectionId = sectionMatch[1].toUpperCase()
          const courseCode = sectionId.split("-")[0]
          botResponse = handleRegistrationRequest(courseCode, sectionId)

          if (botResponse === "CONFIRMATION_PENDING") {
            setIsTyping(false)
            return
          }
        }
      } else if (lowerContent.includes("show") && (lowerContent.includes("course") || lowerContent.includes("all"))) {
        const courseList = courses
          .map((c) => {
            const lectureCount = c.sections.filter((s) => s.type === "lecture").length
            const labInfo = c.hasLab ? " (Has Lab)" : ""
            const prereqInfo = c.prereq.length > 0 ? ` | Prereq: ${c.prereq.join(", ")}` : ""
            return `• ${c.code} - ${c.title}${labInfo}\n  ${c.credits} credits | ${lectureCount} sections${prereqInfo}`
          })
          .join("\n\n")

        botResponse = `📚 Available Courses:\n\n${courseList}\n\nTo see sections for a specific course, ask "Show sections for SOEN2351"`
      } else if (lowerContent.includes("section")) {
        const courseMatch = content.match(/([A-Z]+\d+)/i)
        if (courseMatch) {
          const courseCode = courseMatch[1].toUpperCase()
          const course = courses.find((c) => c.code === courseCode)

          if (course) {
            const lectures = course.sections
              .filter((s) => s.type === "lecture")
              .map((s) => `  ${s.sectionId}\n  ${s.instructor}\n  ${s.days} ${s.time} | ${s.room}`)
              .join("\n\n")

            const labs = course.hasLab
              ? "\n\n🔬 Lab Sections:\n" +
                course.sections
                  .filter((s) => s.type === "lab")
                  .map((s) => `  ${s.sectionId}\n  ${s.instructor}\n  ${s.days} ${s.time} | ${s.room}`)
                  .join("\n\n")
              : ""

            botResponse = `${course.code} - ${course.title}\n${course.credits} credits${course.prereq.length > 0 ? ` | Prerequisites: ${course.prereq.join(", ")}` : ""}\n\n📖 Lecture Sections:\n${lectures}${labs}\n\nTo register, type: "Register me for ${course.sections[0].sectionId}"`
          } else {
            botResponse = `❌ Course ${courseCode} not found. Type "Show me all courses" to see available courses.`
          }
        } else {
          botResponse = "Please specify a course code, e.g., 'Show sections for SOEN2351'"
        }
      } else if (lowerContent.includes("registered") || lowerContent.includes("my courses")) {
        if (registeredSections.length === 0) {
          botResponse =
            "You haven't registered for any courses yet. Type 'Show me all courses' to browse available courses."
        } else {
          const registeredDetails = registeredSections
            .map((section) => {
              return `• ${section.courseCode} - ${section.courseTitle}\n  Section: ${section.sectionId} (${section.type})\n  ${section.days} ${section.time} | ${section.room}\n  ${section.credits} credits`
            })
            .join("\n\n")

          const uniqueCourses = new Map<string, number>()
          registeredSections.forEach((section) => {
            if (!uniqueCourses.has(section.courseCode)) {
              uniqueCourses.set(section.courseCode, section.credits)
            }
          })
          const totalCredits = Array.from(uniqueCourses.values()).reduce((sum, credits) => sum + credits, 0)

          botResponse = `📋 Your Registered Courses:\n\n${registeredDetails}\n\n📊 Total Credits: ${totalCredits}`
        }
      } else if (lowerContent.includes("schedule") || lowerContent.includes("plan")) {
        const availableCourses = courses.filter((c) => {
          const hasPrereqs = c.prereq.every((prereq) => completedCourses.includes(prereq))
          const notRegistered = !registeredSections.some((section) => section.courseCode === c.code)
          return hasPrereqs && notRegistered
        })

        const recommendations = availableCourses
          .slice(0, 5)
          .map((c) => {
            const labInfo = c.hasLab ? " + Lab" : ""
            return `• ${c.code} - ${c.title}${labInfo}\n  ${c.credits} credits | ${c.sections.filter((s) => s.type === "lecture").length} sections available`
          })
          .join("\n\n")

        botResponse = `📅 Recommended Courses for You:\n\n${recommendations}\n\nTo see sections for any course, ask "Show sections for [COURSE CODE]"\n\nOr simply tell me: "Register me for 12 credit hours" and I'll automatically select the best courses for you!`
      } else if (lowerContent.includes("conflict")) {
        if (registeredSections.length < 2) {
          botResponse =
            "You need at least 2 registered courses to check for conflicts. Register for more courses first!"
        } else {
          botResponse =
            "✅ Great news! I've analyzed your schedule and found no time conflicts. All your courses fit perfectly!"
        }
      } else {
        botResponse =
          "I can help you with:\n\n• 'Show me all courses' - Browse available courses\n• 'Show sections for SOEN2351' - View course sections\n• 'Register me for SOEN2351-01' - Register for a section\n• 'Register me for 12 credit hours' - Auto-register for courses\n• 'Show my registered courses' - View your schedule\n• 'Plan my schedule' - Get course recommendations\n\nWhat would you like to do?"
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: botResponse,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt)
  }

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-accent hover:bg-accent/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full animate-pulse" />
        </Button>
      )}

      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[90vw] sm:w-[380px] h-[500px] sm:h-[600px] max-h-[calc(100vh-3rem)] shadow-2xl z-50 flex flex-col overflow-hidden rounded-2xl">
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-foreground/20 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">PMU Registration Assistant</h3>
                <p className="text-xs text-primary-foreground/80">Always here to help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-3 bg-secondary/50 border-b shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Button
                    key={action.label}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action.prompt)}
                    className="shrink-0 text-xs gap-1.5 h-8"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {action.label}
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.type === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2.5 text-sm whitespace-pre-line",
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-2.5">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t bg-background shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage(inputValue)
              }}
              className="flex gap-2"
            >
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      )}

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && handleCancelledRegistration()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.isBulk ? "Confirm Bulk Registration" : "Confirm Course Registration"}
            </AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {confirmDialog.isBulk
                ? "Are you sure you want to register for all these courses?"
                : "Are you sure you want to register for this course?"}
              {"\n\n"}
              {confirmDialog.sectionDetails}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelledRegistration}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedRegistration}>
              {confirmDialog.isBulk ? "Register All" : "Confirm Registration"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
