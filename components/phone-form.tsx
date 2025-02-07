"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface PhoneFormProps {
  onSubmit: (phone: string) => void
  loading?: boolean
}

export function PhoneForm({ onSubmit, loading }: PhoneFormProps) {
  const [phone, setPhone] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(phone)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Code...
          </>
        ) : (
          "Send Code"
        )}
      </Button>
    </form>
  )
}


