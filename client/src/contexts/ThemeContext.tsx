import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  switchable?: boolean;
}

/** Resolve the initial theme:
 *  1. If the user has previously chosen a theme, use it.
 *  2. Otherwise, respect the OS preference (prefers-color-scheme).
 *  3. Fall back to the provided defaultTheme.
 */
function resolveInitialTheme(defaultTheme: Theme, switchable: boolean): Theme {
  if (switchable) {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
    // No stored preference — use OS preference
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  }
  return defaultTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  switchable = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() =>
    resolveInitialTheme(defaultTheme, switchable)
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [theme, switchable]);

  // Also listen for OS preference changes when no manual choice has been made
  useEffect(() => {
    if (!switchable) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      // Only follow OS if the user hasn't manually chosen
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "dark" : "light");
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [switchable]);

  const toggleTheme = switchable
    ? () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"));
      }
    : undefined;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
