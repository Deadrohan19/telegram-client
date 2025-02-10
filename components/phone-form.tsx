"use client"

import { useEffect, useRef, useState } from "react"
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(phone)
  }

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current?.focus(); // Autofocus on mount
    }
  }, []);
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone" className="dark:text-white">Phone Number</Label>
        <Input
          ref={inputRef}
          id="phone"
          type="tel"
          placeholder="+910123456789"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={loading}
          className="dark:text-white"
        />
      </div>
      <Button type="submit" className="w-full dark:bg-white dark:text-black" disabled={loading}>
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


