"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function VisibleQuestionnaire() {
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
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-center">Interactive Questionnaire</h1>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <motion.div
          className="h-full bg-green-500"
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="w-full space-y-4 relative">
        {questions.map((question, index) => {
          const isAnswered = answeredQuestions.includes(index)
          const isActive = index === activeQuestionIndex

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0.7, y: 20 }}
              animate={{
                opacity: isActive ? 1 : isAnswered ? 0.7 : 0.5,
                y: 0,
                scale: isActive ? 1 : 0.98,
                borderColor: isAnswered ? "rgb(34, 197, 94)" : isActive ? "rgb(59, 130, 246)" : "rgb(229, 231, 235)",
              }}
              transition={{ duration: 0.3 }}
              className={`w-full p-5 rounded-lg border-2 ${
                isAnswered
                  ? "border-green-500 bg-green-50"
                  : isActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex flex-col space-y-3">
                <h2
                  className={`font-medium ${
                    isAnswered ? "text-green-700" : isActive ? "text-blue-700" : "text-gray-500"
                  }`}
                >
                  {index === 0
                    ? "🧊 Ice Breaker"
                    : index === questions.length - 1
                      ? "🚀 Next Steps"
                      : `Question ${index + 1}`}
                </h2>
                <p
                  className={`text-lg ${isAnswered ? "text-green-800" : isActive ? "text-gray-800" : "text-gray-400"}`}
                >
                  {question}
                </p>
                {isActive && (
                  <div className="text-sm text-blue-500 font-medium text-right">Press Enter ↵ to continue</div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Congratulations message */}
      <AnimatePresence>
        {isCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, height: 0 }}
            animate={{ opacity: 1, scale: 1, height: "auto" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full mt-8 p-6 bg-green-100 border-2 border-green-500 rounded-lg text-center"
          >
            <div className="w-20 h-20 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Congratulations!</h2>
            <p className="text-green-700 text-lg">You've successfully completed all 7 questions.</p>
            <p className="text-green-600 mt-2">Thank you for taking the time to go through this questionnaire.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 text-sm text-gray-500">
        {answeredQuestions.length} of {questions.length} questions answered
      </div>
    </div>
  )
}
