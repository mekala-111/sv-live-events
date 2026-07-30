import { Helmet } from 'react-helmet-async'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function AdminSettings() {
  return (
    <>
      <Helmet><title>Settings</title></Helmet>
      <h1 className="font-display text-3xl font-bold">Platform Settings</h1>
      <div className="mt-8 max-w-2xl space-y-8">
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold">General</h2>
          <div className="mt-4 space-y-4">
            <Input label="Company Name" defaultValue="SV Live Events" />
            <Input label="Support Phone" defaultValue="9397364040" />
            <Input label="Support Email" defaultValue="svliveevents@gmail.com" />
          </div>
        </section>
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-xl font-semibold">Streaming</h2>
          <div className="mt-4 space-y-4">
            <Input label="Default Stream Password Policy" defaultValue="8 characters minimum" />
            <Input label="Recording Retention (days)" defaultValue="30" type="number" />
          </div>
        </section>
        <Button>Save Settings</Button>
      </div>
    </>
  )
}
