import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

type Post = {
  id: string
  title: string
  slug: string
  category?: string | null
  coverImage?: string | null
  isPublished: boolean
  createdAt: string
}

export default function AdminBlogs() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => (await api.get<{ data: Post[] }>('/admin/blogs')).data.data,
  })

  return (
    <>
      <Helmet><title>Blog Management</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Blog Posts</h1>
        <Button disabled title="Blog write API not wired">New Post</Button>
      </div>
      {isError && <p className="mt-4 text-sm text-red-400">Could not load posts</p>}
      {isLoading && <p className="mt-4 text-sm text-white/40">Loading…</p>}
      <div className="mt-8 space-y-4">
        {data.map((post) => (
          <div key={post.id} className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6">
            <div className="flex gap-4">
              {post.coverImage ? (
                <img src={post.coverImage} alt="" className="h-20 w-28 rounded-xl object-cover" />
              ) : (
                <div className="flex h-20 w-28 items-center justify-center rounded-xl bg-white/5 text-xs text-white/30">No image</div>
              )}
              <div>
                <h3 className="font-display font-semibold">{post.title}</h3>
                <p className="text-sm text-white/50">
                  {post.category || 'General'} · {new Date(post.createdAt).toLocaleDateString()} · {post.isPublished ? 'Published' : 'Draft'}
                </p>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && !data.length && <p className="text-white/40">No blog posts yet</p>}
      </div>
    </>
  )
}
