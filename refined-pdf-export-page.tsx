"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Download, Copy, Check } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

interface Question {
  question: string
  emoji: string
  title: string
}

interface ExportPageProps {
  title?: string
  questions?: Question[]
  notes?: string[]
}

export default function RefinedPDFExportPage({
  title = "Discovery Copilot",
  questions: initialQuestions = [],
  notes = [],
}: ExportPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [parsedNotes, setParsedNotes] = useState<string[]>([])
  const [currentDate, setCurrentDate] = useState("")
  const [callDuration, setCallDuration] = useState("00:08") // Default value
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)

  // Parse notes from URL if available
  useEffect(() => {
    const notesParam = searchParams?.get("notes")
    if (notesParam) {
      try {
        const decodedNotes = JSON.parse(decodeURIComponent(notesParam))
        if (Array.isArray(decodedNotes)) {
          setParsedNotes(decodedNotes)
        }
      } catch (e) {
        console.error("Error parsing notes:", e)
      }
    }

    // Get questions from URL if available
    const questionsParam = searchParams?.get("questions")
    if (questionsParam) {
      try {
        const decodedQuestions = JSON.parse(decodeURIComponent(questionsParam))
        if (Array.isArray(decodedQuestions)) {
          // Update the questions with the ones from the URL
          setQuestions(decodedQuestions)
        }
      } catch (e) {
        console.error("Error parsing questions:", e)
      }
    }

    // Get call duration from URL if available
    const durationParam = searchParams?.get("duration")
    if (durationParam) {
      setCallDuration(durationParam)
    }

    // Format current date
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }
    setCurrentDate(now.toLocaleDateString("en-US", options))
  }, [searchParams])

  // Use default questions if none provided
  const defaultQuestions: Question[] = [
    {
      question: "Quick one before we dive in – what's been the highlight of your week so far?",
      emoji: "🧊🔥",
      title: "Ice‑breaker",
    },
    {
      question: "What ARR are you aiming to hit by Demo Day, and how critical is reaching that target?",
      emoji: "🎯",
      title: "Demo Day dream Goal & Urgency",
    },
    {
      question: "Give me the quick snapshot: weekly call volume, average deal size, and current close rate?",
      emoji: "📸",
      title: "Pipeline & Conversion",
    },
    {
      question: "Roughly how much qualified revenue do you think slips through each month?",
      emoji: "💸",
      title: "Revenue Leakage",
    },
    {
      question: "What have you tried so far to improve conversions, and where does it still fall short?",
      emoji: "🛠️✅",
      title: "Current Efforts & Gaps",
    },
    {
      question: "What timeline are you working with to solve this before Demo Day?",
      emoji: "🕖",
      title: "Timeline",
    },
    {
      question:
        "Sounds like closing the extra $200 K/month is mission‑critical. Want to see how Nomi's real‑time coaching moves those numbers?",
      emoji: "📟",
      title: "Transition to Demo",
    },
    {
      question: "Is there anything else I should know before we wrap up?",
      emoji: "💬",
      title: "Closing",
    },
  ]

  const displayQuestions = questions.length > 0 ? questions : defaultQuestions
  const displayNotes = parsedNotes.length > 0 ? parsedNotes : notes

  // Generate and download PDF
  const generatePDF = () => {
    setIsGenerating(true)

    // Small delay to show the generating state
    setTimeout(() => {
      window.print()
      setIsGenerating(false)
    }, 100)
  }

  // Copy content to clipboard
  const copyToClipboard = () => {
    const content = `${title}\n\n${displayQuestions
      .map((q, i) => `${i + 1}. ${q.question}${displayNotes[i] ? `\n   Notes: ${displayNotes[i]}` : ""}`)
      .join("\n\n")}`

    navigator.clipboard
      .writeText(content)
      .then(() => {
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  // Return to previous page
  const goBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header - only visible when not printing */}
      <header className="print:hidden bg-white border-b border-[#ECECF1] py-4 px-6 flex justify-between items-center sticky top-0 z-10">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-[#6E6E80] hover:text-[#353740] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[#353740] bg-white border border-[#ECECF1] hover:bg-[#F7F7F8] rounded-md transition-colors"
          >
            {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {isCopied ? "Copied!" : "Copy Text"}
          </button>
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-[#10A37F] hover:bg-[#0D8C6D] rounded-md transition-colors disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Export PDF"}
          </button>
        </div>
      </header>

      {/* Content - visible both on screen and when printing */}
      <main className="max-w-[800px] mx-auto p-8 bg-white">
        <div className="flex justify-between items-center border-b border-[#ECECF1] pb-4 mb-8">
          <h1 className="text-2xl font-medium text-[#353740]">{title}</h1>
          <p className="text-sm text-[#6E6E80]">{currentDate}</p>
        </div>

        <div className="space-y-4">
          {displayQuestions.map((item, index) => (
            <div key={index} className="bg-[#F7F7F8] rounded-md p-4">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 min-w-[24px] text-[#353740] font-medium">{index + 1}.</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">
                      {item.emoji} {item.title}
                    </span>
                    <span className="text-sm text-[#10A37F]">✓ Completed</span>
                  </div>
                  <p className="text-lg text-[#353740]">{item.question}</p>

                  {displayNotes[index] && (
                    <div className="mt-2 text-[#353740]">
                      <p className="text-base">{displayNotes[index]}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Session Summary Section */}
        <div className="mt-12 pt-8 border-t border-[#ECECF1]">
          <h2 className="text-xl font-medium text-[#353740] mb-4">Session Summary</h2>
          <p className="text-base text-[#353740] mb-2">Call duration: {callDuration}</p>
          <p className="text-base text-[#353740] mb-8">
            Questions completed: {displayQuestions.length} of {displayQuestions.length}
          </p>

          <div className="text-center text-sm text-[#6E6E80] mt-12 pt-4 border-t border-[#ECECF1]">
            Generated with Discovery Copilot on {currentDate}
          </div>

          {/* Logo */}
          <div className="flex justify-center items-center mt-6">
            <div className="flex items-center">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-sXugxVswZYRutSmV6jimcBXoPr9XLt.svg"
                alt="Nomi Logo"
                className="h-6 w-auto mr-2"
              />
              <span className="font-semibold text-[#353740]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                Nomi
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1.5cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .bg-[#F7F7F8] {
            background-color: #F7F7F8 !important;
          }
          .rounded-md {
            border-radius: 0.375rem !important;
          }
          .text-[#10A37F] {
            color: #10A37F !important;
          }
          .text-[#353740] {
            color: #353740 !important;
          }
          .text-[#6E6E80] {
            color: #6E6E80 !important;
          }
          .border-[#ECECF1] {
            border-color: #ECECF1 !important;
          }
        }
      `}</style>
    </div>
  )
}
