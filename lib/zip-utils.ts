// Utility to generate a downloadable zip file for a game
import JSZip from "jszip"
import type { GameStageData } from "@/components/game-generator"

export async function generateGameZip(game: GameStageData): Promise<Blob> {
  const zip = new JSZip()
  // Add HTML file
  zip.file("index.html", `<!DOCTYPE html>\n<html>\n<head>\n<meta charset='utf-8'>\n<title>${game.title}</title>\n<link rel='stylesheet' href='style.css'>\n</head>\n<body>\n<div id='game-container'>\n${game.html}\n</div>\n<script src='script.js'></script>\n</body>\n</html>`)
  // Add CSS
  zip.file("style.css", game.css)
  // Add JS
  zip.file("script.js", game.js)
  if (game.md) {
    zip.file("README.md", game.md)
  }
  return zip.generateAsync({ type: "blob" })
}
