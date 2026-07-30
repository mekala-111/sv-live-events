import { Helmet } from 'react-helmet-async'
import { Headphones, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function DashboardSupport() {
  return (
    <>
      <Helmet><title>Support</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Support Center</h1>
      <p className="mt-2 text-white/50">Our team is available 24/7 on event days</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          { icon: Phone, title: 'Call Us', desc: '9397364040', href: 'tel:9397364040' },
          { icon: Mail, title: 'Email', desc: 'svliveevents@gmail.com', href: 'mailto:svliveevents@gmail.com' },
          { icon: Headphones, title: 'Live Chat', desc: 'Available on event day', href: undefined },
        ].map((item) => (
          <div key={item.title} className="glass rounded-2xl p-6 text-center">
            <item.icon className="mx-auto h-8 w-8 text-gold" />
            <h3 className="mt-4 font-display font-semibold">{item.title}</h3>
            {item.href ? (
              <a href={item.href} className="mt-2 block text-sm text-gold-light hover:underline">{item.desc}</a>
            ) : (
              <p className="mt-2 text-sm text-white/50">{item.desc}</p>
            )}
          </div>
        ))}
      </div>

      <div className="glass mt-10 max-w-lg space-y-4 rounded-3xl p-8">
        <h2 className="font-display text-xl font-semibold">Submit a Ticket</h2>
        <Input label="Subject" placeholder="Describe your issue" />
        <div className="space-y-2">
          <label className="text-sm text-white/70">Message</label>
          <textarea rows={4} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 focus:border-gold/50 focus:outline-none" />
        </div>
        <Button>Submit Ticket</Button>
      </div>
    </>
  )
}
