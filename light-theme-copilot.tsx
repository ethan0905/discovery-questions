"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, CheckCircle, ChevronRight, Flag } from "lucide-react"

export default function LightThemeCopilot() {
  // Custom colors
  const customGreen = "#21D2AF"
  const iceBreakBlue = "#00EEFF"
  const nextStepOrange = "#FF7300"

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

  // Handle keydown events globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          setActiveQuestionIndex(activeQuestionIndex + 1)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeQuestionIndex, answeredQuestions, questions.length])

  return (
    <div className="w-[60%] mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-100 p-3 flex justify-between items-center border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-gray-800" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
          Discovery Copilot
        </h1>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="h-5 w-5" />
          <span className="text-base font-medium" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            {formatTime(callTime)}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="p-3 flex items-center gap-3">
        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: customGreen }}
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div
          className="text-sm font-medium text-gray-700 min-w-[45px]"
          style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
        >
          {Math.round(progressPercentage)}%
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="mb-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            {answeredQuestions.length}/{questions.length} Questions
          </span>
          <span className="text-sm font-medium text-gray-500" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Press Enter ↵ after asking
          </span>
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

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: isActive ? 1 : 0.6,
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
                  className={`p-3 rounded-md ${
                    isActive
                      ? `bg-gray-100 border-l-4 ${
                          isIceBreaker ? "border-[#00EEFF]" : isNextStep ? "border-[#FF7300]" : "border-[#21D2AF]"
                        }`
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isActive && (
                      <>
                        {isNextStep ? (
                          <Flag className="h-8 w-8 mt-1 flex-shrink-0" style={{ color: nextStepOrange }} />
                        ) : (
                          <ChevronRight
                            className="h-8 w-8 mt-1 flex-shrink-0"
                            style={{ color: isIceBreaker ? iceBreakBlue : customGreen }}
                          />
                        )}
                      </>
                    )}
                    <div className="flex-1">
                      {isActive && (isIceBreaker || isNextStep) && (
                        <div
                          className="text-base font-medium mb-1"
                          style={{
                            color: isIceBreaker ? iceBreakBlue : nextStepOrange,
                            fontFamily: "Helvetica, Arial, sans-serif",
                          }}
                        >
                          {isIceBreaker ? "🧊 ICE BREAKER" : "🚀 NEXT STEPS"}
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "30px",
                          lineHeight: 1.2,
                          fontFamily: "Helvetica, Arial, sans-serif",
                          fontWeight: 500,
                          color: isActive
                            ? isIceBreaker
                              ? iceBreakBlue
                              : isNextStep
                                ? nextStepOrange
                                : "#333333"
                            : "#777777",
                        }}
                      >
                        {question}
                      </div>
                      {isActive && (
                        <p
                          className="text-base mt-2"
                          style={{
                            fontFamily: "Helvetica, Arial, sans-serif",
                            color: isIceBreaker ? `${iceBreakBlue}BB` : isNextStep ? `${nextStepOrange}BB` : "#666666",
                          }}
                        >
                          {isIceBreaker
                            ? "Start with this question to understand their needs"
                            : isNextStep
                              ? "Establish clear next steps before ending the call"
                              : "Listen carefully and take notes on their response"}
                        </p>
                      )}
                    </div>
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
              className="mt-3 p-4 bg-gray-100 rounded-md"
              style={{ borderColor: `${customGreen}66`, borderWidth: "1px" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-7 w-7" style={{ color: customGreen }} />
                <h3
                  className="text-xl font-medium"
                  style={{ color: customGreen, fontFamily: "Helvetica, Arial, sans-serif" }}
                >
                  Discovery Complete
                </h3>
              </div>
              <p className="text-lg text-gray-700" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                You've covered all key discovery questions. Consider scheduling a follow-up or demo based on their
                needs.
              </p>
              <div
                className="mt-3 pt-3 text-base"
                style={{
                  borderTopColor: "#e5e7eb",
                  borderTopWidth: "1px",
                  color: customGreen,
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
