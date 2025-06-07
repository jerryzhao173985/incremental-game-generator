"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CodeViewer from "./code-viewer"
import MarkdownRenderer from "./markdown-renderer"

interface GameStageProps {
  stageNumber: number
  stageData: any
  isLatest: boolean
}

export default function GameStage({ stageNumber, stageData, isLatest }: GameStageProps) {
  const [expanded, setExpanded] = useState(isLatest)

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <CardTitle className="text-white">
          Stage {stageNumber}: {stageData.title}
        </CardTitle>
      </CardHeader>
      {expanded && (
        <CardContent className="space-y-4 text-purple-200">
          <p>{stageData.description}</p>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="css">CSS</TabsTrigger>
              <TabsTrigger value="js">JS</TabsTrigger>
              {stageData.md && <TabsTrigger value="docs">Docs</TabsTrigger>}
            </TabsList>
            <TabsContent value="preview">
              <div dangerouslySetInnerHTML={{ __html: stageData.html }} />
            </TabsContent>
            <TabsContent value="html">
              <CodeViewer code={stageData.html} language="html" />
            </TabsContent>
            <TabsContent value="css">
              <CodeViewer code={stageData.css} language="css" />
            </TabsContent>
            <TabsContent value="js">
              <CodeViewer code={stageData.js} language="javascript" />
            </TabsContent>
            {stageData.md && (
              <TabsContent value="docs">
                <MarkdownRenderer content={stageData.md} />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      )}
    </Card>
  )
}
