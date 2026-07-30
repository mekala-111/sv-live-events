"use client";

import { createContext, useContext, useMemo } from "react";
import { siteConfig } from "@/src/data/siteConfig";

const ThemeContext = createContext(null);

/**
 * @param {{ children: import("react").ReactNode, theme?: Record<string, string> }} props
 */
export function ThemeProvider({ children, theme = null }) {
  const value = useMemo(
    () => ({
      ...siteConfig.theme,
      ...(theme ?? {}),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  return ctx ?? siteConfig.theme;
}

export default ThemeContext;
