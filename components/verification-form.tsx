"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface VerificationFormProps {
  onSubmit: (code: string) => void
  onBack: () => void
}

export function VerificationForm({ onSubmit, onBack }: VerificationFormProps) {
  const [code, setCode] = useState(["", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)

    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newCode.every((digit) => digit) && newCode.join("").length === 5) {
      onSubmit(newCode.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Verification Code</h2>
        </div>
        <div className="flex justify-center gap-2">
          {code.map((digit, index) => (
            <Input
              key={index}
              type="text"
              maxLength={1}
              placeholder="-"
              className="w-12 h-12 text-center text-2xl"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              ref={(el) => {inputRefs.current[index] = el; return;}}
            />
          ))}
        </div>
      </div>
      <Button variant="link" className="w-full text-sm text-gray-500" onClick={onBack}>
        Change Phone Number
      </Button>
    </div>
  )
}


