import { Helmet } from 'react-helmet-async'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

const users = [
  { id: '1', name: 'Admin User', email: 'admin@svliveevents.com', role: 'ADMIN', status: 'Active' },
  { id: '2', name: 'Demo Customer', email: 'customer@svliveevents.com', role: 'CUSTOMER', status: 'Active' },
  { id: '3', name: 'Production Lead', email: 'crew@svliveevents.com', role: 'STAFF', status: 'Active' },
  { id: '4', name: 'Amit Mehta', email: 'amit.mehta@gmail.com', role: 'CUSTOMER', status: 'Active' },
]

export default function AdminUsers() {
  return (
    <>
      <Helmet><title>Users</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">User Management</h1>
        <Button>Add User</Button>
      </div>
      <div className="glass mt-8 overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4"><Badge variant={u.role === 'ADMIN' ? 'gold' : 'default'}>{u.role}</Badge></td>
                <td className="p-4"><Badge variant="success">{u.status}</Badge></td>
                <td className="p-4"><Button variant="ghost" size="sm">Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
