import { Helmet } from 'react-helmet-async'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { testimonials } from '@/data/dummy'

export default function AdminTestimonials() {
  return (
    <>
      <Helmet><title>Testimonials</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Testimonials</h1>
        <Button>Add Testimonial</Button>
      </div>
      <div className="mt-8 space-y-4">
        {testimonials.map((t) => (
          <div key={t.id} className="glass flex flex-wrap items-start justify-between gap-4 rounded-2xl p-6">
            <div>
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-3 max-w-2xl text-white/80">&ldquo;{t.content}&rdquo;</p>
              <p className="mt-3 font-medium">{t.name} · {t.role}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="danger" size="sm">Remove</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
