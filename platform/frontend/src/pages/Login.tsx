import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import logo from '@/assets/Logo.png'

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

const DEMO = {
  admin: { email: 'admin@svliveevents.com', password: 'Admin@123' },
  customer: { email: 'customer@svliveevents.com', password: 'Customer@123' },
} as const

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: DEMO.admin.email, password: DEMO.admin.password },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const user = await login(data.email, data.password)
      const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
      navigate(isAdmin ? '/admin/events' : '/dashboard')
    } catch (err) {
      const apiMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      const network = !(err as { response?: unknown })?.response
      setError(
        apiMessage ||
          (network
            ? 'Cannot reach the API. Start the backend on port 5001, or use the demo Admin button.'
            : 'Invalid credentials. Use Admin@123 for the admin demo account.'),
      )
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (kind: keyof typeof DEMO) => {
    form.setValue('email', DEMO[kind].email, { shouldValidate: true })
    form.setValue('password', DEMO[kind].password, { shouldValidate: true })
    setError('')
    void form.handleSubmit(onSubmit)()
  }

  return (
    <>
      <Helmet>
        <title>Sign In</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center px-6 pt-20 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center">
            <img src={logo} alt="SV Live Events" className="mx-auto h-20 w-20 rounded-full object-cover" />
            <h1 className="mt-4 font-display text-4xl font-bold">Welcome Back</h1>
            <p className="mt-2 text-white/50">Sign in to your SV Live Events account</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="glass mt-10 space-y-6 rounded-3xl p-8">
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />
            {error ? <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="glass mt-6 rounded-2xl p-6 text-sm">
            <p className="font-medium text-gold-light">Demo Credentials</p>
            <p className="mt-1 text-xs text-white/40">Click a card to sign in instantly</p>
            <div className="mt-3 space-y-2 text-white/60">
              <button
                type="button"
                disabled={loading}
                className="block w-full rounded-xl border border-white/10 px-3 py-2 text-left transition hover:border-gold/40 hover:bg-white/5 disabled:opacity-50"
                onClick={() => fillDemo('admin')}
              >
                <span className="text-white/80">Admin:</span> admin@svliveevents.com / Admin@123
              </button>
              <button
                type="button"
                disabled={loading}
                className="block w-full rounded-xl border border-white/10 px-3 py-2 text-left transition hover:border-gold/40 hover:bg-white/5 disabled:opacity-50"
                onClick={() => fillDemo('customer')}
              >
                <span className="text-white/80">Customer:</span> customer@svliveevents.com / Customer@123
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-white/50">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-gold-light hover:underline">
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}
