import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  subject: z.string().min(3),
  message: z.string().min(10),
})

type FormData = z.infer<typeof schema>

export default function ContactPage() {
  const [sent, setSent] = useState(false)
  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = () => {
    setSent(true)
  }

  return (
    <>
      <Helmet><title>Contact</title></Helmet>
      <div className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <p className="text-sm tracking-widest text-gold uppercase">Contact</p>
              <h1 className="mt-4 font-display text-5xl font-bold">
                Let&apos;s Plan Your <span className="text-gradient-gold">Next Event</span>
              </h1>
              <p className="mt-6 text-lg text-white/60">
                Reach out for quotes, site surveys, or technical consultations. We respond within 2 business hours.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  { icon: Phone, label: 'Phone', value: '9397364040', href: 'tel:9397364040' },
                  { icon: Mail, label: 'Email', value: 'svliveevents@gmail.com', href: 'mailto:svliveevents@gmail.com' },
                  { icon: MapPin, label: 'Head Office', value: 'Hyderabad, Telangana — Pan India Service', href: undefined },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-white/50">{item.label}</p>
                      {item.href ? (
                        <a href={item.href} className="font-medium text-white hover:text-gold-light">{item.value}</a>
                      ) : (
                        <p className="font-medium">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              {sent ? (
                <div className="glass rounded-3xl p-10 text-center">
                  <Send className="mx-auto h-12 w-12 text-gold" />
                  <h2 className="mt-4 font-display text-2xl font-bold">Message Sent!</h2>
                  <p className="mt-2 text-white/60">We&apos;ll get back to you within 2 business hours.</p>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="glass space-y-5 rounded-3xl p-8">
                  <Input label="Name" {...form.register('name')} error={form.formState.errors.name?.message} />
                  <Input label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
                  <Input label="Phone" {...form.register('phone')} error={form.formState.errors.phone?.message} />
                  <Input label="Subject" {...form.register('subject')} error={form.formState.errors.subject?.message} />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/70">Message</label>
                    <textarea
                      {...form.register('message')}
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-gold/50 focus:outline-none"
                    />
                  </div>
                  <Button type="submit" className="w-full"><Send className="h-4 w-4" /> Send Message</Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  )
}
