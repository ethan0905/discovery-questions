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

export default function PDFExportPage({ title = "Discovery Copilot", questions = [], notes = [] }: ExportPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  // Parse notes from URL if available
  useEffect(() => {
    const notesParam = searchParams?.get("notes")
    if (notesParam) {
      try {
        const decodedNotes = JSON.parse(decodeURIComponent(notesParam))
        if (Array.isArray(decodedNotes)) {
          notes = decodedNotes
        }
      } catch (e) {
        console.error("Error parsing notes:", e)
      }
    }
  }, [searchParams])

  // Use default questions if none provided
  const defaultQuestions: Question[] = [
    {
      question: "What challenges is your business currently facing?",
      emoji: "🧊",
      title: "Brise-glace",
    },
    {
      question: "What solutions have you tried before and what were the results?",
      emoji: "🔍",
      title: "Solutions Précédentes",
    },
    {
      question: "What would success look like for you in the next 6-12 months?",
      emoji: "🎯",
      title: "Définition du Succès",
    },
    {
      question: "Who else is involved in the decision-making process?",
      emoji: "👥",
      title: "Parties Prenantes",
    },
    {
      question: "What's your timeline for implementing a solution?",
      emoji: "⏱️",
      title: "Calendrier",
    },
    {
      question: "What's your budget range for this initiative?",
      emoji: "💰",
      title: "Budget",
    },
    {
      question: "What would be your next steps after this call?",
      emoji: "🚀",
      title: "Prochaines Étapes",
    },
  ]

  const displayQuestions = questions.length > 0 ? questions : defaultQuestions

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
      .map((q, i) => `${i + 1}. ${q.question}${notes[i] ? `\n   Notes: ${notes[i]}` : ""}`)
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
    <div className="min-h-screen bg-white">
      {/* Header - only visible when not printing */}
      <div className="print:hidden bg-white border-b border-[#ECECF1] py-4 px-6 flex justify-between items-center">
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
      </div>

      {/* Content - visible both on screen and when printing */}
      <div className="max-w-[800px] mx-auto p-8 bg-white">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-[#353740] mb-2">{title}</h1>
          <div className="h-1 w-16 bg-[#10A37F]"></div>
        </div>

        <div className="space-y-6">
          {displayQuestions.map((item, index) => (
            <div key={index} className="border-b border-[#ECECF1] pb-6 last:border-0">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#F7F7F8] rounded-full flex items-center justify-center text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-[#10A37F]">{item.emoji}</span>
                    <span className="text-sm font-medium text-[#6E6E80]">{item.title}</span>
                  </div>
                  <p className="text-xl text-[#353740]">{item.question}</p>

                  {notes[index] && (
                    <div className="mt-3 pl-4 border-l-2 border-[#ECECF1]">
                      <p className="text-sm text-[#6E6E80] italic">Notes:</p>
                      <p className="text-base text-[#353740]">{notes[index]}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-[#ECECF1] text-sm text-[#6E6E80] flex justify-between items-center">
          <p>Generated on {new Date().toLocaleDateString()}</p>
          <p>{title}</p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
