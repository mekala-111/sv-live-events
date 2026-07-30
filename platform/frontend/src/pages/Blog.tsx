import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowRight, Clock } from 'lucide-react'
import { blogPosts } from '@/data/dummy'

export default function BlogPage() {
  return (
    <>
      <Helmet><title>Blog</title></Helmet>
      <div className="pt-32 pb-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm tracking-widest text-gold uppercase">Insights</p>
            <h1 className="mt-4 font-display text-5xl font-bold">
              Live Streaming <span className="text-gradient-gold">Blog</span>
            </h1>
            <p className="mt-4 max-w-2xl text-white/60">
              Guides, best practices, and industry trends from our production team.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group glass overflow-hidden rounded-3xl"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <span className="rounded-full bg-gold/15 px-3 py-1 text-xs text-gold-light">{post.category}</span>
                  <h2 className="mt-4 font-display text-xl font-semibold group-hover:text-gold-light">{post.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{post.excerpt}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-white/40">
                    <span>{post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                  </div>
                  <Link to={`/blog/${post.slug}`} className="mt-4 inline-flex items-center gap-1 text-sm text-gold-light hover:underline">
                    Read more <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
