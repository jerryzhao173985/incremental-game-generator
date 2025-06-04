"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { templates, GameTemplate } from "@/lib/templates"

interface TemplateSelectorProps {
  onSelect: (template: GameTemplate | null) => void
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<string>("")

  return (
    <div className="space-y-2">
      <h3 className="text-white text-lg font-semibold">Choose a Starting Template (optional)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {templates.map((t) => (
          <Card
            key={t.id}
            className={`p-4 cursor-pointer bg-white/5 border-white/10 ${selected === t.id ? "border-purple-500" : ""}`}
            onClick={() => {
              setSelected(t.id)
              onSelect(t)
            }}
          >
            <h4 className="text-white font-medium mb-1">{t.title}</h4>
            <p className="text-purple-200 text-sm">{t.description}</p>
          </Card>
        ))}
      </div>
      <Button variant="outline" className="mt-2" onClick={() => {setSelected(""); onSelect(null)}}>
        No Template
      </Button>
    </div>
  )
}
