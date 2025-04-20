"use client"

import type React from "react"

import { useState, useRef, useEffect, type KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function StackedQuestionnaire() {
  const questions = [
    "If you could have dinner with any historical figure, who would it be and why?", // Ice breaker
    "What's the biggest challenge you're facing in your current project?",
    "What skill would you most like to improve in the next 6 months?",
    "What's one tool or resource that has significantly improved your workflow?",
    "What's something you've learned recently that surprised you?",
    "If you could automate one part of your job, what would it be?",
    "What's your next step after completing this questionnaire?", // Next step
  ]

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [inputValues, setInputValues] = useState<string[]>(Array(questions.length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, questions.length)
  }, [questions.length])

  // Focus the active input
  useEffect(() => {
    if (inputRefs.current[activeQuestionIndex]) {
      inputRefs.current[activeQuestionIndex]?.focus()
    }
  }, [activeQuestionIndex])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Enter" && index === activeQuestionIndex) {
      e.preventDefault()

      // Mark current question as answered
      if (!answeredQuestions.includes(index)) {
        setAnsweredQuestions([...answeredQuestions, index])
      }

      // Move to next question if not at the end
      if (activeQuestionIndex < questions.length - 1) {
        setActiveQuestionIndex(activeQuestionIndex + 1)
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newInputValues = [...inputValues]
    newInputValues[index] = e.target.value
    setInputValues(newInputValues)
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-8 text-center">Interactive Questionnaire</h1>

      <div className="w-full space-y-4 relative">
        <AnimatePresence>
          {questions.map((question, index) => {
            const isAnswered = answeredQuestions.includes(index)
            const isActive = index === activeQuestionIndex
            const isPending = index > activeQuestionIndex

            // Don't render answered questions
            if (isAnswered) return null

            return (
              <motion.div
                key={index}
                initial={{ opacity: isPending ? 0.5 : 1, y: 0 }}
                animate={{
                  opacity: isActive ? 1 : 0.5,
                  y: isActive ? 0 : `${(index - activeQuestionIndex) * 20}px`,
                  scale: isActive ? 1 : 0.98,
                  zIndex: questions.length - index,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  marginBottom: 0,
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.3 }}
                className={`w-full p-5 rounded-lg border ${
                  isActive ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
                }`}
                style={{
                  position: "relative",
                  pointerEvents: isActive ? "auto" : "none",
                }}
              >
                <div className="flex flex-col space-y-3">
                  <h2 className={`font-medium ${isActive ? "text-blue-700" : "text-gray-500"}`}>
                    {index === 0
                      ? "🧊 Ice Breaker"
                      : index === questions.length - 1
                        ? "🚀 Next Steps"
                        : `Question ${index + 1}`}
                  </h2>
                  <p className={`text-lg ${isActive ? "text-gray-800" : "text-gray-400"}`}>{question}</p>
                  <div className="relative">
                    <input
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      value={inputValues[index]}
                      onChange={(e) => handleInputChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`w-full p-3 border rounded-md ${
                        isActive
                          ? "border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          : "border-gray-200 bg-gray-100"
                      }`}
                      placeholder={isActive ? "Type your answer and press Enter to continue..." : ""}
                      disabled={!isActive}
                    />
                    {isActive && (
                      <div className="absolute right-3 top-3 text-sm text-blue-500 font-medium">Press Enter ↵</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {answeredQuestions.length === questions.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full p-6 bg-green-50 border border-green-200 rounded-lg text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-green-800 mb-2">All questions completed!</h2>
            <p className="text-green-700">Thank you for your responses.</p>
          </motion.div>
        )}
      </div>

      <div className="mt-8 w-full">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {answeredQuestions.length} of {questions.length} questions answered
          </span>
          <div className="flex space-x-1">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  answeredQuestions.includes(index)
                    ? "bg-blue-500"
                    : index === activeQuestionIndex
                      ? "bg-blue-300"
                      : "bg-gray-200"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
