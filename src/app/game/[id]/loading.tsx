import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading game...</p>
      </div>
    </div>
  )
}
