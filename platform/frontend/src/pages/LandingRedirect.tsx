import { useEffect } from 'react'
import { landingUrl } from '@/lib/landing'

/** Sends visitors to the Next.js marketing landing (canonical home). */
export default function LandingRedirect() {
  useEffect(() => {
    window.location.replace(landingUrl())
  }, [])

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-sm text-white/50" role="status">
      Redirecting to SV Live Events…
    </div>
  )
}
