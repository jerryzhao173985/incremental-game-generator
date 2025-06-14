"use client"

interface GameStageProps {
  stageNumber: number
  stageData: any
  isLatest: boolean
  onRevert?: () => void
}

export default function GameStage({ stageNumber, stageData, isLatest, onRevert }: GameStageProps) {
  return (
    <div className="border rounded-md p-4 bg-white/5 border-white/10">
      <h3 className="text-xl font-semibold text-white mb-2">
        Stage {stageNumber}: {stageData.title}
      </h3>
      <p className="text-purple-200 mb-4">{stageData.description}</p>
      {!isLatest && onRevert && (
        <button
          onClick={onRevert}
          className="text-sm text-purple-300 hover:text-white underline"
        >
          Revert to this stage
        </button>
      )}
    </div>
  )
}
