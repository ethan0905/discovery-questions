"use client"

import { useSearchParams } from "next/navigation"
import RefinedPDFExportPage from "../../refined-pdf-export-page"

export default function PDFExportRoute() {
  const searchParams = useSearchParams()
  const title = searchParams.get("title") || "Discovery Copilot"
  const duration = searchParams.get("duration") || "00:00"

  return <RefinedPDFExportPage title={title} />
}
