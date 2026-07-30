import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Calendar, Check, CreditCard, Gift, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { bookingExtras, eventTypes, packages } from '@/data/dummy'
import { cn, formatCurrency } from '@/lib/utils'

const steps = [
  { id: 1, title: 'Event Type', icon: Sparkles },
  { id: 2, title: 'Date & Venue', icon: Calendar },
  { id: 3, title: 'Package', icon: Gift },
  { id: 4, title: 'Extras', icon: Gift },
  { id: 5, title: 'Payment', icon: CreditCard },
  { id: 6, title: 'Confirmation', icon: Check },
]

const schema = z.object({
  eventType: z.string().min(1, 'Select an event type'),
  eventDate: z.string().min(1, 'Select a date'),
  venue: z.string().min(3, 'Enter venue name'),
  city: z.string().min(2, 'Enter city'),
  packageId: z.string().min(1, 'Select a package'),
  extras: z.array(z.string()),
  name: z.string().min(2, 'Enter your name'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  paymentMethod: z.enum(['card', 'upi', 'bank']),
})

type FormData = z.infer<typeof schema>

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      extras: [],
      paymentMethod: 'upi',
    },
  })

  const selectedPackage = packages.find((p) => p.id === form.watch('packageId'))
  const selectedExtras = bookingExtras.filter((e) => form.watch('extras')?.includes(e.id))
  const total = (selectedPackage?.price ?? 0) + selectedExtras.reduce((s, e) => s + e.price, 0)

  const next = async () => {
    const fields: (keyof FormData)[][] = [
      ['eventType'],
      ['eventDate', 'venue', 'city'],
      ['packageId'],
      ['extras'],
      ['name', 'email', 'phone', 'paymentMethod'],
    ]
    const valid = await form.trigger(fields[step - 1])
    if (valid) setStep((s) => Math.min(s + 1, 6))
  }

  const toggleExtra = (id: string) => {
    const current = form.getValues('extras') ?? []
    form.setValue(
      'extras',
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    )
  }

  return (
    <>
      <Helmet><title>Book Your Event</title></Helmet>
      <div className="min-h-screen pt-28 pb-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm tracking-widest text-gold uppercase">Booking Wizard</p>
            <h1 className="mt-4 font-display text-4xl font-bold">Reserve Your Live Stream</h1>
          </div>

          {/* Progress */}
          <div className="mt-12 flex justify-between">
            {steps.map((s) => (
              <div key={s.id} className="flex flex-1 flex-col items-center">
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition',
                    step >= s.id ? 'border-gold bg-gold/20 text-gold-light' : 'border-white/20 text-white/40',
                  )}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span className="mt-2 hidden text-xs text-white/50 sm:block">{s.title}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-gold transition-all" style={{ width: `${((step - 1) / 5) * 100}%` }} />
          </div>

          <div className="glass mt-10 rounded-3xl p-8 md:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {step === 1 && (
                  <div>
                    <h2 className="font-display text-2xl font-semibold">What type of event?</h2>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {eventTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => form.setValue('eventType', type)}
                          className={cn(
                            'rounded-2xl border p-4 text-left transition',
                            form.watch('eventType') === type
                              ? 'border-gold bg-gold/10 text-gold-light'
                              : 'border-white/10 hover:border-white/20',
                          )}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {form.formState.errors.eventType && (
                      <p className="mt-2 text-sm text-red-400">{form.formState.errors.eventType.message}</p>
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-2xl font-semibold">When & where?</h2>
                    <Input label="Event Date" type="date" {...form.register('eventDate')} error={form.formState.errors.eventDate?.message} />
                    <Input label="Venue Name" placeholder="e.g. Taj Falaknuma Palace" {...form.register('venue')} error={form.formState.errors.venue?.message} />
                    <Input label="City" placeholder="Hyderabad" {...form.register('city')} error={form.formState.errors.city?.message} />
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Choose your package</h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {packages.filter((p) => !p.custom).map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => form.setValue('packageId', pkg.id)}
                          className={cn(
                            'rounded-2xl border p-6 text-left transition',
                            form.watch('packageId') === pkg.id ? 'border-gold bg-gold/10' : 'border-white/10',
                          )}
                        >
                          <p className="font-display text-xl font-bold">{pkg.name}</p>
                          <p className="mt-1 text-2xl text-gold-light">{formatCurrency(pkg.price)}</p>
                          <p className="mt-2 text-sm text-white/50">{pkg.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div>
                    <h2 className="font-display text-2xl font-semibold">Add extras (optional)</h2>
                    <div className="mt-6 space-y-3">
                      {bookingExtras.map((extra) => (
                        <button
                          key={extra.id}
                          type="button"
                          onClick={() => toggleExtra(extra.id)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-2xl border p-4 text-left transition',
                            form.watch('extras')?.includes(extra.id) ? 'border-gold bg-gold/10' : 'border-white/10',
                          )}
                        >
                          <div>
                            <p className="font-medium">{extra.name}</p>
                            <p className="text-sm text-white/50">{extra.description}</p>
                          </div>
                          <span className="text-gold-light">+{formatCurrency(extra.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-2xl font-semibold">Contact & payment</h2>
                    <Input label="Full Name" {...form.register('name')} error={form.formState.errors.name?.message} />
                    <Input label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
                    <Input label="Phone" {...form.register('phone')} error={form.formState.errors.phone?.message} />
                    <div>
                      <p className="mb-3 text-sm text-white/70">Payment Method</p>
                      <div className="flex gap-3">
                        {(['upi', 'card', 'bank'] as const).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => form.setValue('paymentMethod', m)}
                            className={cn(
                              'rounded-xl border px-4 py-2 capitalize',
                              form.watch('paymentMethod') === m ? 'border-gold bg-gold/10' : 'border-white/10',
                            )}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="glass rounded-2xl p-4">
                      <p className="text-sm text-white/50">Order Total</p>
                      <p className="font-display text-3xl font-bold text-gold-light">{formatCurrency(total)}</p>
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check className="h-10 w-10" />
                    </div>
                    <h2 className="mt-6 font-display text-3xl font-bold">Booking Confirmed!</h2>
                    <p className="mt-4 text-white/60">
                      Reference <span className="text-gold-light">BK-2026-{Math.floor(Math.random() * 9000 + 1000)}</span>.
                      Our team will contact you within 24 hours to confirm site survey and technical requirements.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                      <Link to="/dashboard"><Button>View Dashboard</Button></Link>
                      <Button variant="outline" onClick={() => navigate('/')}>Back Home</Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {step < 6 && (
              <div className="mt-10 flex justify-between">
                <Button variant="ghost" onClick={() => setStep((s) => Math.max(s - 1, 1))} disabled={step === 1}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={next}>
                  {step === 5 ? 'Confirm & Pay' : 'Continue'} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
