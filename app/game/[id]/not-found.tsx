import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Bug } from "lucide-react"

export default function GameNotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Game Not Found</h1>
        <p className="text-gray-700 mb-6">The game you are looking for doesn't exist or has been removed.</p>
        <div className="flex gap-3">
          <Link href="/" passHref>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Home className="h-4 w-4 mr-2" />
              Return to Generator
            </Button>
          </Link>
          <Link href="/debug" passHref>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Bug className="h-4 w-4 mr-2" />
              Debug Storage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
