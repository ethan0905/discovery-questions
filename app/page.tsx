"use client"

import DiscoveryCopilot from "../discovery-copilot"

export default function Page() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full flex-1 flex items-center justify-center">
        <DiscoveryCopilot />
      </div>
      <footer className="w-full flex justify-center mt-6 mb-4">
        <img src="/make.svg" alt="Make" className="h-6 w-auto" aria-hidden="true" />
      </footer>
    </main>
  )
}
