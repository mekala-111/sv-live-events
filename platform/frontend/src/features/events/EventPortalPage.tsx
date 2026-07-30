import { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { DEFAULT_EVENT } from '@/constants/eventPortal'
import { eventSchema } from '@/features/events/schema'
import type { EventFormValues } from '@/types/event'
import {
  deleteEvent,
  duplicateEvent,
  fetchAnalytics,
  fetchEvent,
  saveEvent,
} from '@/services/eventService'
import { AdminHeader } from '@/components/layout/AdminHeader'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EventPortalSkeleton } from '@/components/ui/Skeleton'
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

export default function EventPortalPage() {
  const outlet = useOutletContext<OutletCtx | undefined>()
  const openMobileNav = outlet?.openMobileNav ?? (() => {})
  const { user } = useAuth()
  const { toast, ToastHost } = useToast()
  const queryClient = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const eventQuery = useQuery({ queryKey: ['event', 'evt_demo'], queryFn: () => fetchEvent() })
  const analyticsQuery = useQuery({ queryKey: ['event-analytics'], queryFn: fetchAnalytics })

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: DEFAULT_EVENT,
    mode: 'onChange',
  })

  useEffect(() => {
    if (eventQuery.data) form.reset(eventQuery.data)
  }, [eventQuery.data, form])

  const saveMutation = useMutation({
    mutationFn: ({ data, as }: { data: EventFormValues; as: 'draft' | 'publish' }) => saveEvent(data, as),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['event'] })
      toast(vars.as === 'publish' ? 'Event published successfully' : 'Draft saved')
    },
    onError: () => toast('Could not save event', 'error'),
  })

  const duplicateMutation = useMutation({
    mutationFn: duplicateEvent,
    onSuccess: (data) => {
      form.reset(data)
      toast('Event duplicated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      setConfirmDelete(false)
      form.reset(DEFAULT_EVENT)
      toast('Event deleted', 'info')
    },
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
    window.open(`/live/${slug}`, '_blank')
    toast('Opening preview', 'info')
  }

  if (eventQuery.isLoading) return <EventPortalSkeleton />

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
        <div className="mb-8">
          <p className="text-sm text-white/45">
            Configure every detail of your live event — streaming, branding, access, and publish in one place.
          </p>
          {form.watch('themeId') && (
            <div
              className="mt-4 h-1.5 w-full max-w-xs rounded-full opacity-80"
              style={{
                background:
                  form.watch('themeId') === 'wedding'
                    ? 'linear-gradient(90deg,#f7b733,#ff8a00)'
                    : undefined,
              }}
              aria-hidden
            />
          )}
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
              onDuplicate={() => duplicateMutation.mutate()}
              onDelete={() => setConfirmDelete(true)}
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
        message="This will reset the current event draft. This action cannot be undone."
        confirmLabel="Delete Event"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  )
}
