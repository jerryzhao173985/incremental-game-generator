"use client"

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { AVAILABLE_MODELS } from "@/lib/openai-utils"

interface ModelSelectorProps {
  value: string
  onChange: (model: string) => void
}

export default function ModelSelector({ value, onChange }: ModelSelectorProps) {
  return (
    <div className="min-w-[8rem]">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-white/5 border-white/10 text-white">
          <SelectValue placeholder="Model" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_MODELS.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
