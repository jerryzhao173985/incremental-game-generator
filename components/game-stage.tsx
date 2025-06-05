"use client"

import CodeViewer from "./code-viewer"
import MarkdownRenderer from "./markdown-renderer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface GameStageProps {
  stageNumber: number
  stageData: any
}

export default function GameStage({ stageNumber, stageData }: GameStageProps) {
  return (
    <Accordion type="single" collapsible className="border rounded-md bg-white/5 border-white/10">
      <AccordionItem value="stage">
        <AccordionTrigger className="px-4 py-3 text-left text-xl font-semibold text-white">
          Stage {stageNumber}: {stageData.title}
        </AccordionTrigger>
        <AccordionContent className="space-y-4 p-4">
          <p className="text-purple-200">{stageData.description}</p>
          <Accordion type="multiple" className="space-y-2">
            <AccordionItem value="html">
              <AccordionTrigger className="text-sm">HTML</AccordionTrigger>
              <AccordionContent>
                <CodeViewer code={stageData.html} language="html" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="css">
              <AccordionTrigger className="text-sm">CSS</AccordionTrigger>
              <AccordionContent>
                <CodeViewer code={stageData.css} language="css" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="js">
              <AccordionTrigger className="text-sm">JavaScript</AccordionTrigger>
              <AccordionContent>
                <CodeViewer code={stageData.js} language="javascript" />
              </AccordionContent>
            </AccordionItem>
            {stageData.md && (
              <AccordionItem value="docs">
                <AccordionTrigger className="text-sm">Docs</AccordionTrigger>
                <AccordionContent>
                  <MarkdownRenderer content={stageData.md} />
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
