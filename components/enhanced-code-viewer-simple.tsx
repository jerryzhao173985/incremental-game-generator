"use client"

import { useState, useRef, useEffect } from "react"

interface EnhancedCodeViewerProps {
  code: string
  language: string
  fileName: string
  maxHeight?: string
}

const EnhancedCodeViewer = ({ code, language, fileName, maxHeight = "50vh" }: EnhancedCodeViewerProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  const handleCopyClick = async () => {
    try {
      if (preRef.current) {
        await navigator.clipboard.writeText(preRef.current.textContent || "")
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
      setIsCopied(false)
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      import("prismjs").then((Prism) => {
        Prism.highlightAll()
      })
    }
  }, [code, language])

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        <button
          onClick={handleCopyClick}
          className="bg-gray-700 text-gray-200 hover:bg-gray-600 rounded px-2 py-1 text-xs focus:outline-none"
        >
          {isCopied ? "Copied!" : "Copy"}
        </button>
        <span className="text-gray-400 text-xs">{fileName}</span>
      </div>
      <pre
        ref={preRef}
        style={{ maxHeight: maxHeight, overflow: "auto" }}
        className={`language-${language} bg-gray-800 text-gray-100 p-4 rounded`}
      >
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
}

export default EnhancedCodeViewer
