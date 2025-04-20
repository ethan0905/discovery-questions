"use client"

import type React from "react"

import { useState, useEffect, useRef, type KeyboardEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"

export default function InteractiveQuestionnaire() {
  const questions = [
    "If you could have dinner with any historical figure, who would it be and why?", // Ice breaker
    "What's the biggest challenge you're facing in your current project?",
    "What skill would you most like to improve in the next 6 months?",
    "What's one tool or resource that has significantly improved your workflow?",
    "What's something you've learned recently that surprised you?",
    "If you could automate one part of your job, what would it be?",
    "What's your next step after completing this questionnaire?", // Next step
  ]

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answered, setAnswered] = useState<boolean[]>(Array(questions.length).fill(false))
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Focus the input when the component mounts or when the question changes
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentQuestionIndex])

  useEffect(() => {
    // Update progress based on current question
    setProgress((currentQuestionIndex / questions.length) * 100)
  }, [currentQuestionIndex, questions.length])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "Tab") && currentQuestionIndex < questions.length) {
      e.preventDefault()

      // Mark current question as answered
      const newAnswered = [...answered]
      newAnswered[currentQuestionIndex] = true
      setAnswered(newAnswered)

      // Move to next question if not at the end
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setInputValue("")
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const isCompleted = currentQuestionIndex === questions.length - 1 && answered[questions.length - 1]

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-3xl mx-auto p-6 bg-gradient-to-b from-gray-50 to-gray-100 rounded-xl shadow-lg">
      <div className="w-full mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-500 mt-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="w-full h-40 relative">
        <AnimatePresence mode="wait">
          {!isCompleted && (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute w-full"
            >
              <h2 className="text-2xl font-bold mb-6 text-gray-800">{questions[currentQuestionIndex]}</h2>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your answer and press Enter or Tab to continue..."
                  aria-label={`Question ${currentQuestionIndex + 1}: ${questions[currentQuestionIndex]}`}
                />
                <div className="absolute right-3 top-4 text-sm text-gray-400">Press Enter or Tab to continue</div>
              </div>
            </motion.div>
          )}

          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute w-full flex flex-col items-center justify-center"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">All questions completed!</h2>
              <p className="text-gray-600">Thank you for your responses.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-16 w-full">
        <div className="flex justify-center space-x-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                answered[index] ? "bg-blue-500" : index === currentQuestionIndex ? "bg-gray-400" : "bg-gray-200"
              }`}
              aria-label={`Question ${index + 1} ${
                answered[index] ? "completed" : index === currentQuestionIndex ? "current" : "upcoming"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
