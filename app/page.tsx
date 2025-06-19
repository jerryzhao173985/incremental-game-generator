import GameGenerator from "@/components/game-generator"

export default function Home() {
  return (
    <main className="min-h-screen p-4 sm:p-6 md:p-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10 sm:mb-14">
          <div className="space-y-6">
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-3 leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-purple-200 via-white to-purple-200 bg-clip-text text-transparent">
                  Incremental Game
                </span>
              </h1>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Generator
                </span>
              </h2>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-xl sm:text-2xl text-purple-200 leading-relaxed font-medium">
                Watch as AI builds a game through five progressive iterations, 
                each one adding new features and complexity
              </p>
              
              <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/30">
                <p className="text-lg text-purple-100 leading-relaxed">
                  Experience the magic of AI-driven game development. From a simple concept to a polished, 
                  playable game in just five stages. Perfect for learning, experimenting, or creating your next gaming masterpiece.
                </p>
              </div>
            </div>
          </div>
        </header>

        <GameGenerator />

        <footer className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20">
            <p className="text-purple-300/90 text-base font-medium">
              Built with Next.js and OpenAI
            </p>
            <p className="text-purple-400/70 text-sm mt-2">
              Powered by GPT-4o for intelligent game generation
            </p>
          </div>
        </footer>
      </div>
    </main>
  )
}