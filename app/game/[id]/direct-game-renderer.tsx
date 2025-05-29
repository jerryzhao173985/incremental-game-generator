"use client"
import SuperRobustGameRenderer from "@/components/super-robust-game-renderer"

interface DirectGameRendererProps {
  html: string
  css: string
  js: string
  onLog?: (message: string) => void
  onError?: (error: string) => void
  onLoaded?: () => void
  gameId?: string
  debug?: boolean
}

export default function DirectGameRenderer({
  html,
  css,
  js,
  onLog,
  onError,
  onLoaded,
  gameId,
  debug = false,
}: DirectGameRendererProps) {
  // Use our super robust game renderer
  return (
    <SuperRobustGameRenderer
      html={html}
      css={css}
      js={js}
      id={gameId}
      onLog={onLog}
      onError={onError}
      onLoaded={onLoaded}
      debug={debug}
    />
  )
}
