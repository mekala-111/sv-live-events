import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
}

export default function AdminUsers() {
  const { data = [], isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get<{ data: User[] }>('/admin/users')).data.data,
  })

  return (
    <>
      <Helmet><title>Users</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">User Management</h1>
        <Button disabled title="Create via auth/register">Add User</Button>
      </div>
      {isError && <p className="mt-4 text-sm text-red-400">Could not load users</p>}
      <div className="glass mt-8 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td className="p-4 text-white/40" colSpan={4}>Loading…</td></tr>}
            {data.map((u) => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4"><Badge variant={u.role === 'ADMIN' || u.role === 'SUPER_ADMIN' ? 'gold' : 'default'}>{u.role}</Badge></td>
                <td className="p-4"><Badge variant={u.isActive ? 'success' : 'default'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
