import { Helmet } from 'react-helmet-async'
import { Hero } from '@/components/home/Hero'
import { Services } from '@/components/home/Services'
import { WhyUs } from '@/components/home/WhyUs'
import { Portfolio } from '@/components/home/Portfolio'
import { Testimonials } from '@/components/home/Testimonials'
import { PackagesTeaser } from '@/components/home/PackagesTeaser'
import { CTA } from '@/components/home/CTA'

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Home</title>
        <meta name="description" content="SV Live Events — Professional multi-camera live streaming for weddings, corporate events, and more." />
      </Helmet>
      <Hero />
      <Services />
      <WhyUs />
      <Portfolio />
      <Testimonials />
      <PackagesTeaser />
      <CTA />
    </>
  )
}
