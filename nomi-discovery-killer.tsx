"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function NomiDiscoveryKiller() {
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
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

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
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-800">
      <h1 className="text-3xl font-bold mb-4 text-center text-white">Nomi: Discovery killer 🧨</h1>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-800 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-green-500"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="w-full space-y-4 relative">
        <AnimatePresence>
          {questions.map((question, index) => {
            const isAnswered = answeredQuestions.includes(index)
            const isActive = index === activeQuestionIndex

            // Don't render answered questions
            if (isAnswered) return null

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isActive ? 1 : 0.6,
                  y: 0,
                  scale: isActive ? 1 : 0.98,
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginBottom: 0,
                  y: -20,
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.3 }}
                className={`w-full p-5 rounded-lg border ${
                  isActive ? "border-green-500 bg-gray-800" : "border-gray-700 bg-gray-800/50"
                }`}
              >
                <div className="flex flex-col space-y-3">
                  <h2 className={`font-medium ${isActive ? "text-green-400" : "text-gray-400"}`}>
                    {index === 0
                      ? "🧊 Ice Breaker"
                      : index === questions.length - 1
                        ? "🚀 Next Steps"
                        : `Question ${index + 1}`}
                  </h2>
                  <p className={`text-lg ${isActive ? "text-white" : "text-gray-400"}`}>{question}</p>
                  {isActive && (
                    <div className="text-sm text-green-400 font-medium text-right">Press Enter ↵ to continue</div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Congratulations message */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: "auto" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full mt-8 p-6 bg-gray-800 border-2 border-green-500 rounded-lg text-center"
          >
            <div className="w-20 h-20 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Congratulations!</h2>
            <p className="text-green-300 text-lg">You've successfully completed all 7 questions.</p>
            <p className="text-gray-400 mt-2">Thank you for taking the time to go through this questionnaire.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-sm text-gray-400">
        {answeredQuestions.length} of {questions.length} questions answered
      </div>
    </div>
  )
}
