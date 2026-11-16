import { createContext, useContext, useEffect, useState } from 'react'

// The HR pages follow the portal-wide theme (src/components/theme-provider.tsx) instead of keeping
// their own setting, so they always match the light/dark mode the user chose in the top bar.
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} })

const current = () => (typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light')

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(current)
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(current()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => {} }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
