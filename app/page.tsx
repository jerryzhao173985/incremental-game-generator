import GameGenerator from "@/components/game-generator"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-purple-900 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Incremental Game Generator</h1>
          <p className="text-sm text-purple-200">Create and play incremental games with AI</p>
        </div>
      </header>

      <main className="container mx-auto p-4 py-8">
        <GameGenerator />
      </main>

      <footer className="bg-gray-800 text-gray-300 p-4 text-center text-sm mt-8">
        <p>Incremental Game Generator - Built with Next.js and OpenAI</p>
      </footer>
    </div>
  )
}
