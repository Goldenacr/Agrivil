
import React, { createContext, useContext, useEffect, useState } from "react"

const ThemeProviderContext = createContext({
  theme: "light",
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}) {
  // Always initialize as 'light', ignoring local storage or system preferences
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const root = window.document.documentElement

    // Ensure we start with a clean slate
    root.classList.remove("light", "dark")

    // Force add 'light' class
    root.classList.add("light")
    
  }, [theme])

  const value = {
    theme,
    setTheme: (theme) => {
      // Allow setting theme, but effectively it will just stay light if we forced it above. 
      // However, to strictly comply with "force light theme as only option", 
      // we can just make this a no-op or always set 'light'.
      setTheme("light") 
      // We can also remove the item from local storage to prevent persistence of 'dark'
      localStorage.removeItem(storageKey)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
