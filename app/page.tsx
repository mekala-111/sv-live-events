import { SiteShell } from "@/components/site-shell";
import { SiteProvider } from "@/src/context/SiteContext";
import { ThemeProvider } from "@/src/context/ThemeContext";

export default function HomePage() {
  return (
    <SiteProvider>
      <ThemeProvider>
        <SiteShell />
      </ThemeProvider>
    </SiteProvider>
  );
}
