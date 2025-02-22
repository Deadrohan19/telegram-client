"use client";

import { useEffect, useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { PhoneForm } from "@/components/phone-form";
import { VerificationForm } from "@/components/verification-form";
import { TwoStepForm } from "@/components/two-step-form";
import { SuccessScreen } from "@/components/success-screen";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { invoke } from '@tauri-apps/api/core';

type Step = "phone" | "verification" | "two-step" | "success";

interface AuthResponse {
  success: boolean;
  message: string;
  sessionId?: string;
  requires2FA?: boolean;
  phoneCodeHash?: string;
  username?: string;
}

const API_BASE_URL = "http://localhost:5000";

export default function Home() {
  const [step, setStep] = useState<Step>("phone");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneCodeHash, setPhoneCodeHash] = useState("");
  const [sessionId, setSessionId] = useState("");

  const { toast } = useToast();

  const handlePhoneSubmit = async (phone: string) => {
    setLoading(true);
    setPhoneNumber(phone);

    try {
      const res = await axios.post<AuthResponse>(`${API_BASE_URL}/sendCode`, {
        sessionId: sessionId,
        phoneNumber: phone,
      });

      if (res.data.success) {
        setPhoneCodeHash(res.data.phoneCodeHash || "");
        setSessionId(res.data.sessionId ?? "");
        setStep("verification");
      } else {
        toast({
          title: "Error",
          description: res.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (code: string) => {
    setLoading(true);
    try {
      const res = await axios.post<AuthResponse>(`${API_BASE_URL}/verifyCode`, {
        sessionId: sessionId,
        phoneNumber,
        phoneCode: code,
        phoneCodeHash,
      });

      if (res.data.success) {
        setSessionId(res.data.sessionId ?? "");
        if (res.data.requires2FA) {
          setStep("two-step");
        } else {
          const userInfo = await axios.get<AuthResponse>(
            `${API_BASE_URL}/getUserInfo`, {
            params: {
              sessionId: sessionId,
            }
          }
          );

          if (userInfo.data.success) {
            setUsername(userInfo.data.username || "");
            setStep("success");
          }
        }
      } else {
        toast({
          title: "Error",
          description: res.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTwoStepSubmit = async (password: string) => {
    setLoading(true);
    try {
      const res = await axios.post<AuthResponse>(`${API_BASE_URL}/verify2FA`, {
        sessionId: sessionId,
        password,
      });

      if (res.data.success) {
        setSessionId(res.data.sessionId ?? "");
        const userInfo = await axios.get<AuthResponse>(
          `${API_BASE_URL}/getUserInfo`, {
          params: {
            sessionId: sessionId,
          }
        }
        );

        if (userInfo.data.success) {
          setUsername(userInfo.data.username || "");
          setStep("success");
        }
      } else {
        toast({
          title: "Error",
          description: res.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const listener = (event: any) => {
      if (event.key === 'F11') {
        event.preventDefault();
        invoke('toggle_fullscreen');
      }
    }
    window.addEventListener('keydown', listener);
    // Cleanup
    return () => {
      window.removeEventListener('keydown', listener);
    }
  }, [])

  return (
    <AuthLayout>
      {step === "phone" && (
        <PhoneForm onSubmit={handlePhoneSubmit} loading={loading} />
      )}
      {step === "verification" && (
        <VerificationForm
          onSubmit={handleVerificationSubmit}
          onBack={() => setStep("phone")}
          loading={loading}
        />
      )}
      {step === "two-step" && <TwoStepForm onSubmit={handleTwoStepSubmit} loading={loading}/>}
      {step === "success" && <SuccessScreen username={username} />}
    </AuthLayout>
  );
}
