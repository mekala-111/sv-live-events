import { Helmet } from 'react-helmet-async'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardProfile() {
  const { user } = useAuth()
  const form = useForm({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })

  return (
    <>
      <Helmet><title>Profile</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Profile Settings</h1>
      <form className="glass mt-8 max-w-lg space-y-5 rounded-3xl p-8">
        <Input label="Full Name" {...form.register('name')} />
        <Input label="Email" type="email" {...form.register('email')} />
        <Input label="Phone" {...form.register('phone')} />
        <Button type="button">Save Changes</Button>
      </form>
    </>
  )
}
