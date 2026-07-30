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

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, phone: data.phone })
      navigate('/dashboard')
    } catch {
      setError('Registration failed. The email may already be in use or the API is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet><title>Create Account</title></Helmet>
      <div className="flex min-h-screen items-center justify-center px-6 pt-20 pb-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center">
            <h1 className="font-display text-4xl font-bold">Create Account</h1>
            <p className="mt-2 text-white/50">Join SV Live Events to manage bookings and recordings</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="glass mt-10 space-y-5 rounded-3xl p-8">
            <Input label="Full Name" {...form.register('name')} error={form.formState.errors.name?.message} />
            <Input label="Email" type="email" {...form.register('email')} error={form.formState.errors.email?.message} />
            <Input label="Phone" {...form.register('phone')} error={form.formState.errors.phone?.message} />
            <Input label="Password" type="password" {...form.register('password')} error={form.formState.errors.password?.message} />
            <Input label="Confirm Password" type="password" {...form.register('confirmPassword')} error={form.formState.errors.confirmPassword?.message} />
            {error && <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-light hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </>
  )
}
