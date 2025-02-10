import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/lib/theme-config"
import { Button } from "@/components/ui/button"
import type React from "react" // Import React
import { TelegramIcon } from "./TelegramIcon"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Button variant="ghost" size="icon" className="fixed top-4 right-4 dark:bg-gray-880 hover:bg-transparent" onClick={toggleTheme}>
        {theme === "light" ? <Moon className="h-5 w-5 dark:text-white " /> : <Sun className="h-5 w-5 bg-gray-880 text-white" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <TelegramIcon className="w-8 h-8 text-blue-500" />
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Telegram Login</h1>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

