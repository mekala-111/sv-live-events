import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/Button'
import { portfolioItems } from '@/data/dummy'

export default function AdminGallery() {
  return (
    <>
      <Helmet><title>Gallery</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Gallery Management</h1>
        <Button>Upload Media</Button>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {portfolioItems.map((item) => (
          <div key={item.id} className="group relative overflow-hidden rounded-2xl">
            <img src={item.image} alt={item.title} className="aspect-square w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 p-4 opacity-0 transition group-hover:opacity-100">
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-white/60">{item.category}</p>
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="danger" size="sm">Delete</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
