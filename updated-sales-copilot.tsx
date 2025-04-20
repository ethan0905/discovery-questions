"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { Clock, CheckCircle, ChevronRight, Sparkles, Flag } from "lucide-react"

export default function UpdatedSalesCopilot() {
  // Custom color
  const customGreen = "#21D2AF"

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

  // Drag functionality
  const dragControls = useDragControls()
  const constraintsRef = useRef(null)

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

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    dragControls.start(event)
  }

  // Get border color based on question index
  const getBorderColor = (index: number) => {
    if (index === 0) return "border-blue-500" // Ice breaker
    if (index === questions.length - 1) return "border-purple-500" // Next step
    return `border-[${customGreen}]` // Regular questions
  }

  // Get icon color based on question index
  const getIconColor = (index: number) => {
    if (index === 0) return "text-blue-400" // Ice breaker
    if (index === questions.length - 1) return "text-purple-400" // Next step
    return `text-[${customGreen}]` // Regular questions
  }

  return (
    <div className="fixed inset-0 pointer-events-none" ref={constraintsRef}>
      <motion.div
        drag
        dragControls={dragControls}
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={constraintsRef}
        className="pointer-events-auto w-full max-w-md mx-auto bg-slate-900 rounded-lg shadow-xl border border-slate-800 overflow-hidden"
        initial={{ x: 0, y: 0 }}
      >
        {/* Header - Draggable area */}
        <div
          className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700 cursor-move"
          onPointerDown={startDrag}
        >
          <h1 className="text-xl font-semibold text-white">Discovery Copilot</h1>
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{formatTime(callTime)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-800">
          <motion.div
            className="h-full"
            style={{ backgroundColor: customGreen }}
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="mb-2 flex justify-between items-center">
            <span className="text-xs font-medium text-slate-400">
              {answeredQuestions.length}/{questions.length} Questions
            </span>
            <span className="text-xs font-medium text-slate-400">Press Enter ↵ after asking</span>
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
                        ? `bg-slate-800 border-l-4 ${
                            isIceBreaker ? "border-blue-500" : isNextStep ? "border-purple-500" : "border-[#21D2AF]"
                          }`
                        : "bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isActive && (
                        <>
                          {isIceBreaker ? (
                            <Sparkles className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          ) : isNextStep ? (
                            <Flag className="h-5 w-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: customGreen }} />
                          )}
                        </>
                      )}
                      <div className="flex-1">
                        {isActive && (isIceBreaker || isNextStep) && (
                          <div
                            className={`text-xs font-medium mb-1 ${isIceBreaker ? "text-blue-400" : "text-purple-400"}`}
                          >
                            {isIceBreaker ? "🧊 ICE BREAKER" : "🚀 NEXT STEPS"}
                          </div>
                        )}
                        <p
                          className={`text-sm font-medium ${
                            isActive
                              ? isIceBreaker
                                ? "text-blue-100"
                                : isNextStep
                                  ? "text-purple-100"
                                  : "text-white"
                              : "text-slate-300"
                          }`}
                        >
                          {question}
                        </p>
                        {isActive && (
                          <p
                            className={`text-xs mt-1 ${
                              isIceBreaker ? "text-blue-300/70" : isNextStep ? "text-purple-300/70" : "text-slate-400"
                            }`}
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
                className="mt-4 p-4 bg-slate-800 rounded-md"
                style={{ borderColor: `${customGreen}33`, borderWidth: "1px" }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-5 w-5" style={{ color: customGreen }} />
                  <h3 className="font-medium" style={{ color: customGreen }}>
                    Discovery Complete
                  </h3>
                </div>
                <p className="text-sm text-slate-300">
                  You've covered all key discovery questions. Consider scheduling a follow-up or demo based on their
                  needs.
                </p>
                <div
                  className="mt-3 pt-3 text-xs"
                  style={{ borderTopColor: "rgba(30, 41, 59, 0.8)", borderTopWidth: "1px", color: `${customGreen}CC` }}
                >
                  Call duration: {formatTime(callTime)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
