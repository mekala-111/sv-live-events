import { Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageTransition } from '@/components/layout/PageTransition'
import { useLenis } from '@/hooks/useLenis'

export function PublicLayout() {
  useLenis(true)

  return (
    <>
      <a
        href="#main-content"
        className="absolute -left-[9999px] focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to main content
      </a>
      <Helmet defaultTitle="SV Live Events" titleTemplate="%s | SV Live Events" />
      <Navbar />
      <PageTransition>
        <main id="main-content">
          <Outlet />
        </main>
      </PageTransition>
      <Footer />
    </>
  )
}
