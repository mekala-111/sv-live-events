import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Plus } from 'lucide-react'
import { DEFAULT_EVENT } from '@/constants/eventPortal'
import { eventSchema } from '@/features/events/schema'
import type { EventFormValues } from '@/types/event'
import {
  deleteEvent,
  duplicateEvent,
  fetchAnalytics,
  fetchEvent,
  listEvents,
  saveEvent,
} from '@/services/eventService'
import { AdminHeader } from '@/components/layout/AdminHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EventPortalSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import {
  AnalyticsSection,
  BasicInfoSection,
  BrandingSection,
  DetailsSection,
  GuestAccessSection,
  LiveFeaturesSection,
  PublishSection,
  RegistrationSection,
  SeoSection,
  SocialSection,
  StreamingSection,
  ThemeSection,
} from '@/features/events/sections'

type OutletCtx = { openMobileNav: () => void }

const STORAGE_KEY = 'sv_event_portal_id'

export default function EventPortalPage() {
  const outlet = useOutletContext<OutletCtx | undefined>()
  const openMobileNav = outlet?.openMobileNav ?? (() => {})
  const { user } = useAuth()
  const { toast, ToastHost } = useToast()
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [eventId, setEventId] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))
  const [creating, setCreating] = useState(false)

  const listQuery = useQuery({ queryKey: ['events'], queryFn: listEvents })

  useEffect(() => {
    if (listQuery.data && listQuery.data.length === 0) setCreating(true)
  }, [listQuery.data])

  useEffect(() => {
    if (!listQuery.data?.length || creating) return
    const stillThere = eventId && listQuery.data.some((e) => e.id === eventId)
    if (!stillThere) {
      const next = listQuery.data[0].id
      setEventId(next)
      localStorage.setItem(STORAGE_KEY, next)
    }
  }, [listQuery.data, eventId, creating])

  const activeId = creating ? null : eventId

  const eventQuery = useQuery({
    queryKey: ['event', activeId],
    queryFn: () => fetchEvent(activeId!),
    enabled: Boolean(activeId),
  })

  const analyticsQuery = useQuery({
    queryKey: ['event-analytics', activeId],
    queryFn: () => fetchAnalytics(activeId!),
    enabled: Boolean(activeId),
  })

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: DEFAULT_EVENT,
    mode: 'onChange',
  })

  useEffect(() => {
    if (creating) {
      const stamp = Date.now().toString(36)
      form.reset({
        ...DEFAULT_EVENT,
        name: 'New Live Event',
        slug: `event-${stamp}`,
        status: 'draft',
        streamKey: '',
        guestPassword: `guest${stamp.slice(-6)}`,
        invitationLink: '',
      })
      return
    }
    if (eventQuery.data) form.reset(eventQuery.data)
  }, [eventQuery.data, creating, form])

  const apiErr = (err: unknown, fallback: string) => {
    const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
    return msg || fallback
  }

  const saveMutation = useMutation({
    mutationFn: ({ data, as }: { data: EventFormValues; as: 'draft' | 'publish' }) =>
      saveEvent(data, as, activeId ?? undefined),
    onSuccess: (saved, vars) => {
      setCreating(false)
      if (saved.id) {
        setEventId(saved.id)
        localStorage.setItem(STORAGE_KEY, saved.id)
      }
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event'] })
      toast(vars.as === 'publish' ? 'Event published successfully' : 'Draft saved')
    },
    onError: (err) => toast(apiErr(err, 'Could not save event'), 'error'),
  })

  const duplicateMutation = useMutation({
    mutationFn: () => duplicateEvent(activeId!),
    onSuccess: (data) => {
      if (data.id) {
        setEventId(data.id)
        localStorage.setItem(STORAGE_KEY, data.id)
      }
      setCreating(false)
      form.reset(data)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast('Event duplicated')
    },
    onError: (err) => toast(apiErr(err, 'Could not duplicate'), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(activeId!),
    onSuccess: () => {
      setConfirmDelete(false)
      localStorage.removeItem(STORAGE_KEY)
      setEventId(null)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast('Event deleted', 'info')
    },
    onError: (err) => toast(apiErr(err, 'Could not delete'), 'error'),
  })

  const onCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast(`${label} copied`)
    } catch {
      toast('Copy failed', 'error')
    }
  }

  const submit = (as: 'draft' | 'publish') =>
    form.handleSubmit(
      (data) => saveMutation.mutate({ data, as }),
      () => toast('Fix validation errors before continuing', 'error'),
    )()

  const onPreview = () => {
    const slug = form.getValues('slug')
    if (!slug) return toast('Set a slug first', 'error')
    window.open(`/live/${slug}`, '_blank')
    toast('Opening preview', 'info')
  }

  const onNew = () => {
    setCreating(true)
    setEventId(null)
  }

  const onSelect = (id: string) => {
    setCreating(false)
    setEventId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  if (listQuery.isLoading || (activeId && eventQuery.isLoading)) return <EventPortalSkeleton />

  return (
    <>
      <Helmet>
        <title>Event Portal | SV Live Events</title>
      </Helmet>
      {ToastHost}

      <AdminHeader
        userName={user?.name ?? 'Admin User'}
        userRole={user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
        onMenuClick={openMobileNav}
        onPreview={onPreview}
        onSaveDraft={() => submit('draft')}
        onPublish={() => submit('publish')}
        saving={saveMutation.isPending}
      />

      <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-white/45">
              Configure every detail of your live event — streaming, branding, access, and publish in one place.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              value={creating ? '' : eventId ?? ''}
              onChange={(e) => e.target.value && onSelect(e.target.value)}
            >
              {creating && <option value="">New event…</option>}
              {(listQuery.data ?? []).map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.status})
                </option>
              ))}
              {!listQuery.data?.length && !creating && <option value="">No events yet</option>}
            </select>
            <Button type="button" variant="outline" size="sm" onClick={onNew}>
              <Plus className="mr-1 h-4 w-4" /> New
            </Button>
          </div>
        </div>

        <FormProvider {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit('draft')
            }}
            className="space-y-6"
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <BasicInfoSection onSave={() => submit('draft')} saving={saveMutation.isPending} />
              <StreamingSection onCopy={onCopy} />
            </div>

            <BrandingSection />
            <ThemeSection />

            <div className="grid gap-6 lg:grid-cols-2">
              <DetailsSection />
              <div className="space-y-6">
                <SocialSection />
                <LiveFeaturesSection />
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <GuestAccessSection onCopy={onCopy} />
              <RegistrationSection />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <SeoSection />
              <AnalyticsSection data={analyticsQuery.data} />
            </div>

            <PublishSection
              onPreview={onPreview}
              onDraft={() => submit('draft')}
              onPublish={() => submit('publish')}
              onDuplicate={() => activeId && duplicateMutation.mutate()}
              onDelete={() => activeId && setConfirmDelete(true)}
            />
          </form>
        </FormProvider>

        <footer className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-white/[0.06] py-6 text-xs text-white/35 sm:flex-row">
          <p>© 2026 SV Live Events. All rights reserved.</p>
          <p>Crafted for unforgettable events.</p>
        </footer>
      </main>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete event?"
        message="This permanently deletes the stream and related sessions. This cannot be undone."
        confirmLabel="Delete Event"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  )
}
