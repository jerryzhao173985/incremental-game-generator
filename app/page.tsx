import GameGenerator from "@/components/game-generator"

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white mb-4">Incremental Game Generator</h1>
          <p className="text-lg sm:text-xl text-purple-200 max-w-2xl mx-auto">
            Watch as AI builds a game through five progressive iterations, each one adding new features and complexity
          </p>
        </header>

        <GameGenerator />

        <footer className="mt-12 text-center text-purple-300/50 text-sm">
          <p>Built with Next.js and OpenAI</p>
        </footer>
      </div>
    </main>
  )
}
