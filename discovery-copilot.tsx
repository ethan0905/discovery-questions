"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, CheckCircle, Settings, Save, X, Copy } from "lucide-react"

// Update the default question data with French titles
const defaultQuestionData = [
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

// Mode types
type Mode = "config" | "start" | "start-notes"

export default function DiscoveryCopilot() {
  // OpenAI theme colors
  const openaiAccent = "#10A37F" // OpenAI's green
  const iceBreakBlue = "#3E8DFF" // Softer blue
  const nextStepOrange = "#FF7A00" // Softer orange

  // State for current mode
  const [mode, setMode] = useState<Mode>("start-notes")

  // State for questions data
  const [questionData, setQuestionData] = useState(defaultQuestionData)

  // State for notes (when in notes mode)
  const [notes, setNotes] = useState<string[]>(Array(defaultQuestionData.length).fill(""))

  // State for editing in config mode
  const [editingData, setEditingData] = useState(defaultQuestionData)

  // Discovery session states
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [callTime, setCallTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [focusTimeoutId, setFocusTimeoutId] = useState<NodeJS.Timeout | null>(null)

  // Add a new state variable for the title near the other state variables
  const [customTitle, setCustomTitle] = useState("Discovery Copilot")
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  // Call timer
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (mode === "start" || mode === "start-notes") {
      intervalId = setInterval(() => {
        setCallTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [mode])

  // Stop timer when all questions are completed
  useEffect(() => {
    if (isCompleted && timerRef.current) {
      clearInterval(timerRef.current)
    }
  }, [isCompleted])

  // Handle keydown events globally for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if the active element is the textarea
      const isTextareaFocused = document.activeElement === textareaRef.current

      // Enter key: mark current question as answered
      if (e.key === "Enter" && activeQuestionIndex < questionData.length) {
        e.preventDefault()

        // Mark current question as answered if not already
        if (!answeredQuestions.includes(activeQuestionIndex)) {
          const newAnsweredQuestions = [...answeredQuestions, activeQuestionIndex]
          setAnsweredQuestions(newAnsweredQuestions)

          // Calculate progress percentage
          const newProgressPercentage = (newAnsweredQuestions.length / questionData.length) * 100
          setProgressPercentage(newProgressPercentage)

          // Check if all questions are answered
          if (newAnsweredQuestions.length === questionData.length) {
            setIsCompleted(true)
          }
        }

        // Move to next question if not at the end
        if (activeQuestionIndex < questionData.length - 1) {
          // Find the next unanswered question
          let nextIndex = activeQuestionIndex + 1
          while (nextIndex < questionData.length && answeredQuestions.includes(nextIndex)) {
            nextIndex++
          }
          if (nextIndex < questionData.length) {
            switchToQuestion(nextIndex)
          }
        }
      }

      // Arrow keys: navigate between questions only if textarea is not focused
      // For left and right arrows, allow default behavior when textarea is focused
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        // If textarea is focused and it's left/right arrow, allow default behavior (text navigation)
        if (isTextareaFocused && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
          return // Allow default behavior for left/right arrows in textarea
        }

        e.preventDefault()

        if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
          // Find the previous unanswered question
          let prevIndex = activeQuestionIndex - 1
          while (prevIndex >= 0 && answeredQuestions.includes(prevIndex)) {
            prevIndex--
          }
          if (prevIndex >= 0) {
            switchToQuestion(prevIndex)
          }
        } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
          // Find the next unanswered question
          let nextIndex = activeQuestionIndex + 1
          while (nextIndex < questionData.length && answeredQuestions.includes(nextIndex)) {
            nextIndex++
          }
          if (nextIndex < questionData.length) {
            switchToQuestion(nextIndex)
          }
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeQuestionIndex, answeredQuestions, questionData.length])

  // Focus the textarea when switching questions in notes mode
  useEffect(() => {
    // Clear any existing timeout
    if (focusTimeoutId) {
      clearTimeout(focusTimeoutId)
    }

    // Only attempt to focus if we're in notes mode
    if (mode === "start-notes") {
      const newFocusTimeoutId = setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 100)

      setFocusTimeoutId(newFocusTimeoutId)
      return () => clearTimeout(newFocusTimeoutId)
    }
  }, [activeQuestionIndex, mode])

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle switching to a different question
  const switchToQuestion = (index: number) => {
    if (index !== activeQuestionIndex && !answeredQuestions.includes(index)) {
      setActiveQuestionIndex(index)
    }
  }

  // Get explanation text in French based on question index
  const getExplanationText = (index: number) => {
    if (index === 0) {
      return "Commencez par cette question pour comprendre leurs besoins."
    } else if (index === questionData.length - 1) {
      return "Établissez des prochaines étapes claires avant de terminer l'appel."
    } else {
      return "Écoutez attentivement et prenez des notes sur leur réponse."
    }
  }

  // Get question color based on index
  const getQuestionColor = (index: number) => {
    if (index === 0) return iceBreakBlue
    if (index === questionData.length - 1) return nextStepOrange
    return openaiAccent
  }

  // Handle note input change
  const handleNoteChange = (index: number, value: string) => {
    const newNotes = [...notes]
    newNotes[index] = value
    setNotes(newNotes)
  }

  // Save configuration changes
  const saveConfig = () => {
    setQuestionData(editingData)
    setMode("start")
    // Reset session state
    setActiveQuestionIndex(0)
    setAnsweredQuestions([])
    setProgressPercentage(0)
    setIsCompleted(false)
    setCallTime(0)
    setNotes(Array(editingData.length).fill(""))
  }

  // Cancel configuration changes
  const cancelConfig = () => {
    setEditingData(questionData)
    setMode("start")
  }

  // Reset to default questions
  const resetToDefault = () => {
    setEditingData(defaultQuestionData)
  }

  // Update a question in config mode
  const updateQuestion = (index: number, field: "question" | "emoji" | "title", value: string) => {
    const newData = [...editingData]
    newData[index] = { ...newData[index], [field]: value }
    setEditingData(newData)
  }

  // Reset the session
  const resetSession = () => {
    setActiveQuestionIndex(0)
    setAnsweredQuestions([])
    setProgressPercentage(0)
    setIsCompleted(false)
    setCallTime(0)
    setNotes(Array(questionData.length).fill(""))
  }

  // Switch mode and reset if needed
  const switchMode = (newMode: Mode) => {
    if (newMode === "config") {
      setEditingData([...questionData])
    } else {
      resetSession()
    }
    setMode(newMode)
  }

  // Add a function to handle title editing
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTitle(e.target.value)
  }

  // Add a function to toggle title editing
  const toggleTitleEditing = () => {
    setIsEditingTitle(!isEditingTitle)
  }

  // Update the generateRecap function to include the custom title
  const navigateToPdfExport = () => {
    // Create a flash effect to indicate the action
    const flashElement = document.createElement("div")
    flashElement.style.position = "fixed"
    flashElement.style.top = "0"
    flashElement.style.left = "0"
    flashElement.style.width = "100%"
    flashElement.style.height = "100%"
    flashElement.style.backgroundColor = "white"
    flashElement.style.opacity = "0.7"
    flashElement.style.zIndex = "9999"
    flashElement.style.pointerEvents = "none"
    flashElement.style.transition = "opacity 0.5s ease-out"

    document.body.appendChild(flashElement)

    // Flash effect
    setTimeout(() => {
      flashElement.style.opacity = "0"
      setTimeout(() => {
        document.body.removeChild(flashElement)
      }, 500)
    }, 100)

    // Format call time for URL
    const formattedCallTime = formatTime(callTime)

    // Encode notes as a URL parameter
    const encodedNotes = encodeURIComponent(JSON.stringify(notes))

    // Open the PDF export page in a new tab/window with notes data and call duration
    window.open(
      `/pdf-export?title=${encodeURIComponent(customTitle)}&notes=${encodedNotes}&duration=${formattedCallTime}`,
      "_blank",
    )
  }

  const generateRecap = () => {
    const takeScreenshotOld = () => {
      // Create a flash effect to indicate screenshot is being taken
      const flashElement = document.createElement("div")
      flashElement.style.position = "fixed"
      flashElement.style.top = "0"
      flashElement.style.left = "0"
      flashElement.style.width = "100%"
      flashElement.style.height = "100%"
      flashElement.style.backgroundColor = "white"
      flashElement.style.opacity = "0.7"
      flashElement.style.zIndex = "9999"
      flashElement.style.pointerEvents = "none"
      flashElement.style.transition = "opacity 0.5s ease-out"

      document.body.appendChild(flashElement)

      // Flash effect
      setTimeout(() => {
        flashElement.style.opacity = "0"
        setTimeout(() => {
          document.body.removeChild(flashElement)
        }, 500)
      }, 100)

      // Show a message to the user with screenshot instructions
      const message = `
    Screenshot taken! 
    
    On Windows: The screenshot was copied to your clipboard. You can paste it into any application.
    On Mac: The screenshot was saved to your desktop.
    On Mobile: The screenshot was saved to your photos.
    
    If automatic screenshot didn't work, please use your device's screenshot function:
    - Windows: Windows+Shift+S or PrtScn
    - Mac: Command+Shift+4
    - iPhone: Power+Volume Up
    - Android: Power+Volume Down
  `

      // Try to use the browser's clipboard API if available
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          // This is a fallback message since we can't actually take a screenshot programmatically
          alert("Please use your device's screenshot function to capture this screen.")
        } catch (err) {
          alert(message)
        }
      } else {
        alert(message)
      }
    }

    return (
      <div className="mt-4 pt-4 border-t border-[#ECECF1]">
        <h4 className="text-base font-medium mb-2 text-black">{customTitle} Summary:</h4>
        <ul className="space-y-1 text-sm text-[#353740]">
          {questionData.map((q, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="font-medium">{i + 1}.</span>
              <span>{q.question}</span>
              {mode === "start-notes" && notes[i] && <span className="ml-2 text-[#6E6E80] italic">— {notes[i]}</span>}
            </li>
          ))}
        </ul>

        {/* Screenshot button instead of export button */}
        <div className="mt-6 pt-4 border-t border-[#ECECF1] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#6E6E80]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#10A37F]"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p className="text-sm">
              <span className="font-medium text-[#353740]">Tip:</span> Save your discovery notes for future reference.
            </p>
          </div>
          <button
            onClick={navigateToPdfExport}
            className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-[#10A37F] hover:bg-[#0D8C6D] rounded-md transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Export PDF
          </button>
        </div>
      </div>
    )
  }

  // Render UI based on mode
  if (mode === "config") {
    return (
      <div className="w-[60%] mx-auto bg-white rounded-lg shadow-sm border border-[#ECECF1] overflow-hidden">
        <div className="bg-[#F7F7F8] p-3 flex justify-between items-center border-b border-[#ECECF1]">
          <h1 className="text-xl font-medium text-black" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
            Configure {customTitle}
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="flex items-center gap-1 px-2 py-1 text-sm text-[#6E6E80] hover:bg-[#F5F5F5] rounded-md"
            >
              <Copy className="h-4 w-4" /> Reset to Default
            </button>
            <button
              onClick={cancelConfig}
              className="flex items-center gap-1 px-2 py-1 text-sm text-[#6E6E80] hover:bg-[#F5F5F5] rounded-md"
            >
              <X className="h-4 w-4" /> Cancel
            </button>
            <button
              onClick={saveConfig}
              className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-[#10A37F] hover:bg-[#0D8C6D] rounded-md"
            >
              <Save className="h-4 w-4" /> Save
            </button>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm text-[#6E6E80] mb-4">
            Customize your discovery questions, titles, and emojis. Changes will be applied when you save.
          </p>

          <div className="space-y-4">
            {editingData.map((item, index) => (
              <div key={index} className="border border-[#ECECF1] rounded-md p-4 bg-white shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="font-medium text-[#353740] mt-2">{index + 1}.</span>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={item.emoji}
                        onChange={(e) => updateQuestion(index, "emoji", e.target.value)}
                        className="w-16 p-2 border border-[#ECECF1] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#E0E0E0]"
                        placeholder="Emoji"
                        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                      />
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => updateQuestion(index, "title", e.target.value)}
                        className="flex-1 p-2 border border-[#ECECF1] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#E0E0E0]"
                        placeholder="Title"
                        style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                      />
                    </div>
                    <textarea
                      value={item.question}
                      onChange={(e) => updateQuestion(index, "question", e.target.value)}
                      className="w-full p-3 border border-[#ECECF1] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#E0E0E0] resize-none"
                      rows={2}
                      placeholder="Question"
                      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render start mode (normal or with notes)
  return (
    <div className="w-[60%] mx-auto bg-white rounded-lg shadow-sm border border-[#ECECF1] overflow-hidden">
      {/* Header */}
      <div className="bg-[#F7F7F8] p-3 flex justify-between items-center border-b border-[#ECECF1]">
        {isEditingTitle ? (
          <div className="flex items-center">
            <input
              type="text"
              value={customTitle}
              onChange={handleTitleChange}
              onBlur={toggleTitleEditing}
              onKeyDown={(e) => e.key === "Enter" && toggleTitleEditing()}
              autoFocus
              className="text-xl font-medium text-black bg-white border border-[#ECECF1] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#E0E0E0]"
              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            />
          </div>
        ) : (
          <h1
            className="text-xl font-medium text-black cursor-pointer hover:bg-[#F5F5F5] px-2 py-1 rounded-md"
            style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
            onClick={toggleTitleEditing}
            title="Click to edit title"
          >
            {customTitle}
          </h1>
        )}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-black">
            <Clock className="h-4 w-4 text-[#6E6E80]" />
            <span className="text-sm font-normal" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
              {formatTime(callTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => switchMode("config")}
              className="p-1 text-[#6E6E80] hover:bg-[#F5F5F5] rounded"
              title="Configure Questions"
            >
              <Settings className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6E6E80]">Notes</span>
              <button
                onClick={() => switchMode(mode === "start" ? "start-notes" : "start")}
                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E0E0E0] focus:ring-offset-2"
                style={{
                  backgroundColor: mode === "start-notes" ? "#10A37F" : "#E5E7EB",
                }}
              >
                <span
                  className={`${
                    mode === "start-notes" ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>
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
            transition={{ duration: 0.4 }}
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
            {answeredQuestions.length}/{questionData.length} Questions
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
            {questionData.map((item, index) => {
              const isAnswered = answeredQuestions.includes(index)
              const isActive = index === activeQuestionIndex
              const questionNumber = index + 1

              // Don't render answered questions
              if (isAnswered) return null

              // Determine background color and border color
              let bgColor = "bg-white"
              let borderColor = ""

              if (isActive) {
                if (index === 0) {
                  bgColor = "bg-[#EBF2FF]"
                  borderColor = "border-[#3E8DFF]"
                } else if (index === questionData.length - 1) {
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
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: isActive ? 1 : 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`p-3 rounded-md ${bgColor} ${isActive ? `border ${borderColor}` : ""} ${
                    !isActive ? "cursor-pointer hover:bg-[#F5F5F5] transition-colors duration-150" : ""
                  }`}
                  onClick={() => !isActive && switchToQuestion(index)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex-1">
                    {isActive && (
                      <div
                        className="text-sm font-medium mb-1"
                        style={{
                          color: getQuestionColor(index),
                          fontFamily: "Helvetica, Arial, sans-serif",
                        }}
                      >
                        {item.emoji} {item.title}
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
                      {questionNumber}. {item.question}
                    </div>
                    {isActive && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                        <p
                          className="text-sm mt-2"
                          style={{
                            fontFamily: "Helvetica, Arial, sans-serif",
                            color: "#353740",
                          }}
                        >
                          {getExplanationText(index)}
                        </p>

                        {/* Notes input field (only in notes mode) */}
                        {mode === "start-notes" && (
                          <div className="mt-3">
                            <textarea
                              ref={textareaRef}
                              value={notes[index]}
                              onChange={(e) => handleNoteChange(index, e.target.value)}
                              className="w-full p-3 border border-[#ECECF1] rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#E0E0E0] resize-none shadow-sm"
                              placeholder="Take notes on their response..."
                              rows={3}
                              style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
                            />
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Completion message with recap */}
        <AnimatePresence>
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="mt-3 p-4 bg-[#EBF9F6] rounded-md border border-[#10A37F]"
            >
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-6 w-6" style={{ color: openaiAccent }} />
                <h3 className="text-lg font-medium text-black" style={{ fontFamily: "Helvetica, Arial, sans-serif" }}>
                  {customTitle} Complete
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

              {/* Questions recap */}
              {generateRecap()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
