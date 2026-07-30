import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/Button'
import { blogPosts } from '@/data/dummy'

export default function AdminBlogs() {
  return (
    <>
      <Helmet><title>Blog Management</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Blog Posts</h1>
        <Button>New Post</Button>
      </div>
      <div className="mt-8 space-y-4">
        {blogPosts.map((post) => (
          <div key={post.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
            <div className="flex gap-4">
              <img src={post.image} alt="" className="h-20 w-28 rounded-xl object-cover" />
              <div>
                <h3 className="font-display font-semibold">{post.title}</h3>
                <p className="text-sm text-white/50">{post.category} · {post.date}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="danger" size="sm">Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
