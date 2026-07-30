"use client";

import { createContext, useContext, useMemo } from "react";
import { getSiteData } from "@/src/data";

const SiteContext = createContext(null);

/**
 * Provides all landing content. Pass `data` to override local files
 * (e.g. from GET /api/site) without changing section components.
 * @param {{ children: import("react").ReactNode, data?: ReturnType<typeof getSiteData> }} props
 */
export function SiteProvider({ children, data = null }) {
  const value = useMemo(() => data ?? getSiteData(), [data]);
  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    return getSiteData();
  }
  return ctx;
}

export default SiteContext;
