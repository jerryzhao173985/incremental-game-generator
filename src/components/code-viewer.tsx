"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

interface CodeViewerProps {
  code: string
  language: string
  fileName?: string
}

export default function CodeViewer({ code, language, fileName }: CodeViewerProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy code:", err)
    }
  }

  return (
    <div className="relative">
      {fileName && (
        <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-mono border-b border-gray-700">{fileName}</div>
      )}
      <div className="absolute top-2 right-2 z-10">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 bg-gray-800/80 hover:bg-gray-700"
          onClick={copyToClipboard}
        >
          {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-gray-300" />}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <pre
        className={`language-${language} overflow-auto p-4 bg-gray-900 text-gray-100 rounded-md`}
        style={{ maxHeight: "70vh" }}
      >
        <code>{code}</code>
      </pre>
    </div>
  )
}
