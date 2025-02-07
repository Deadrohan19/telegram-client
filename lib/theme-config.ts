"use client"

import { createContext, useContext } from "react"

export type Theme = "light" | "dark"

export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => null,
})

export const useTheme = () => useContext(ThemeContext)


