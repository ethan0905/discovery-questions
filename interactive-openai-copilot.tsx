"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, CheckCircle } from "lucide-react"

export default function InteractiveOpenAICopilot() {
  // OpenAI theme colors
  const openaiAccent = "#10A37F" // OpenAI's green
  const iceBreakBlue = "#3E8DFF" // Softer blue
  const nextStepOrange = "#FF7A00" // Softer orange

  // Background tints (very light versions of the colors)
  const blueTint = "#EBF2FF"
  const greenTint = "#EBF9F6"
  const orangeTint = "#FFF4EB"

  // Sales-oriented discovery questions
  const questions = [
    "What challenges is your business currently facing?", // Ice breaker
    "What solutions have you tried before and what were the results?",
    "What would success look like for you in the next 6-12 months?",
    "Who else is involved in the decision-making process?",
    "What's your timeline for implementing a solution?",
    "What's your budget range for this initiative?",
    "What would be your next steps after this call?", // Next step
  ]

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [callTime, setCallTime] = useState(0)

  // Call timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallTime((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex(activeQuestionIndex - 1)
    }
  }

  // Navigate to next question
  const goToNextQuestion = () => {
    const unansweredQuestions = questions.filter((_, index) => !answeredQuestions.includes(index))
    const currentUnansweredIndex = unansweredQuestions.findIndex(
      (_, index) => index === activeQuestionIndex - answeredQuestions.filter((i) => i < activeQuestionIndex).length,
    )

    if (currentUnansweredIndex < unansweredQuestions.length - 1) {
      // Find the actual index in the original questions array
      const nextUnansweredIndex = questions.findIndex((q) => q === unansweredQuestions[currentUnansweredIndex + 1])
      setActiveQuestionIndex(nextUnansweredIndex)
    }
  }

  // Handle keydown events globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter key: mark current question as answered
      if (e.key === "Enter" && activeQuestionIndex < questions.length) {
        e.preventDefault()

        // Mark current question as answered if not already
        if (!answeredQuestions.includes(activeQuestionIndex)) {
          const newAnsweredQuestions = [...answeredQuestions, activeQuestionIndex]
          setAnsweredQuestions(newAnsweredQuestions)

          // Calculate progress percentage
          const newProgressPercentage = (newAnsweredQuestions.length / questions.length) * 100
          setProgressPercentage(newProgressPercentage)

          // Check if all questions are answered
          if (newAnsweredQuestions.length === questions.length) {
            setIsCompleted(true)
          }
        }

        // Move to next question if not at the end
        if (activeQuestionIndex < questions.length - 1) {
          // Find the next unanswered question
          let nextIndex = activeQuestionIndex + 1
          while (nextIndex < questions.length && answeredQuestions.includes(nextIndex)) {
            nextIndex++
          }
          if (nextIndex < questions.length) {
            setActiveQuestionIndex(nextIndex)
          }
        }
      }

      // Arrow keys: navigate between questions
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault()

        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          // Find the previous unanswered question
          let prevIndex = activeQuestionIndex - 1
          while (prevIndex >= 0 && answeredQuestions.includes(prevIndex)) {
            prevIndex--
          }
          if (prevIndex >= 0) {
            setActiveQuestionIndex(prevIndex)
          }
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          // Find the next unanswered question
          let nextIndex = activeQuestionIndex + 1
          while (nextIndex < questions.length && answeredQuestions.includes(nextIndex)) {
            nextIndex++
          }
          if (nextIndex < questions.length) {
            setActiveQuestionIndex(nextIndex)
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeQuestionIndex, answeredQuestions, questions.length])

  // Get explanation text in French based on question index
  const getExplanationText = (index: number) => {
    if (index === 0) {
      return "Commencez par cette question pour comprendre leurs besoins."
    } else if (index === questions.length - 1) {
      return "Établissez des prochaines étapes claires avant de terminer l'appel."
    } else {
      return "Écoutez attentivement et prenez des notes sur leur réponse."
    }
  }

  return (
    <div className="w-[60%] mx-auto bg-white rounded-lg shadow-sm border border-[#ECECF1] overflow-hidden">
      {/* Header */}
      <div className="bg-[#F7F7F8] p-3 flex justify-between items-center border-b border-[#ECECF1]">
        <h1 className="text-xl font-medium text-black" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          Discovery Copilot
        </h1>
        <div className="flex items-center gap-2 text-black">
          <Clock className="h-4 w-4 text-[#6E6E80]" />
          <span className="text-sm font-normal" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            {formatTime(callTime)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="p-3 flex items-center gap-3">
        <div className="flex-1 h-2 bg-[#F7F7F8] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: openaiAccent }}
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-sm font-normal text-black" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm font-normal text-[#6E6E80]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            {answeredQuestions.length}/{questions.length} Questions
          </span>
          <div className="flex items-center gap-4">
            <span className="text-sm font-normal text-[#6E6E80]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              <span className="inline-block px-1 py-0.5 bg-[#F7F7F8] rounded text-xs mr-1">↑↓</span> Navigate
            </span>
            <span className="text-sm font-normal text-[#6E6E80]" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              <span className="inline-block px-1 py-0.5 bg-[#F7F7F8] rounded text-xs mr-1">Enter</span> Complete
            </span>
          </div>
        </div>

        {/* Questions */}
        <div className="flex-1 space-y-2">
          <AnimatePresence>
            {questions.map((question, index) => {
              const isAnswered = answeredQuestions.includes(index)
              const isActive = index === activeQuestionIndex
              const isIceBreaker = index === 0
              const isNextStep = index === questions.length - 1

              // Don't render answered questions
              if (isAnswered) return null

              // Determine background color and border color
              let bgColor = "bg-white"
              let borderColor = ""

              if (isActive) {
                if (isIceBreaker) {
                  bgColor = "bg-[#EBF2FF]"
                  borderColor = "border-[#3E8DFF]"
                } else if (isNextStep) {
                  bgColor = "bg-[#FFF4EB]"
                  borderColor = "border-[#FF7A00]"
                } else {
                  bgColor = "bg-[#EBF9F6]"
                  borderColor = "border-[#10A37F]"
                }
              }

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    marginBottom: 0,
                    y: -10,
                    transition: { duration: 0.2 },
                  }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 rounded-md ${bgColor} ${isActive ? `border ${borderColor}` : ""} ${
                    !isActive ? "cursor-pointer hover:bg-[#F7F7F8] transition-colors" : ""
                  }`}
                  onClick={() => !isActive && setActiveQuestionIndex(index)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex-1">
                    {isActive && (isIceBreaker || isNextStep) && (
                      <div
                        className="text-sm font-medium mb-1"
                        style={{
                          color: isIceBreaker ? iceBreakBlue : nextStepOrange,
                          fontFamily: "Helvetica, Arial, sans-serif",
                        }}
                      >
                        {isIceBreaker ? "🧊 Ice Breaker" : "🚀 Next Steps"}
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: "20px",
                        lineHeight: 1.3,
                        fontFamily: "Helvetica, Arial, sans-serif",
                        fontWeight: 400,
                        color: isActive ? "#000000" : "#8E8EA0",
                      }}
                    >
                      {question}
                    </div>
                    {isActive && (
                      <p
                        className="text-sm mt-2"
                        style={{
                          fontFamily: "Helvetica, Arial, sans-serif",
                          color: "#353740",
                        }}
                      >
                        {getExplanationText(index)}
                      </p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Completion message */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="mt-3 p-4 bg-[#EBF9F6] rounded-md border border-[#10A37F]"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-6 w-6" style={{ color: openaiAccent }} />
                <h3 className="text-lg font-medium text-black" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                  Discovery Complete
                </h3>
              </div>
              <p className="text-base text-black" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                You've covered all key discovery questions. Consider scheduling a follow-up or demo based on their
                needs.
              </p>
              <div
                className="mt-3 pt-3 text-sm"
                style={{
                  borderTopColor: "#ECECF1",
                  borderTopWidth: "1px",
                  color: "#6E6E80",
                  fontFamily: "Helvetica, Arial, sans-serif",
                }}
              >
                Call duration: {formatTime(callTime)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
