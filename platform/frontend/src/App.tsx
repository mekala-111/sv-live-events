import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/lib/auth-store'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

import ServicesPage from '@/pages/Services'
import PortfolioPage from '@/pages/Portfolio'
import PackagesPage from '@/pages/Packages'
import BookingPage from '@/pages/Booking'
import LiveEventPage from '@/pages/LiveEvent'
import LoginPage from '@/pages/Login'
import RegisterPage from '@/pages/Register'
import AboutPage from '@/pages/About'
import ContactPage from '@/pages/Contact'
import BlogPage from '@/pages/Blog'
import FaqPage from '@/pages/Faq'
import LandingRedirect from '@/pages/LandingRedirect'

import DashboardOverview from '@/pages/dashboard/Overview'
import DashboardBookings from '@/pages/dashboard/Bookings'
import DashboardInvoices from '@/pages/dashboard/Invoices'
import DashboardPayments from '@/pages/dashboard/Payments'
import DashboardRecordings from '@/pages/dashboard/Recordings'
import DashboardProfile from '@/pages/dashboard/Profile'
import DashboardSupport from '@/pages/dashboard/Support'
import DashboardNotifications from '@/pages/dashboard/Notifications'

const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminBookings = lazy(() => import('@/pages/admin/Bookings'))
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'))
const AdminPackages = lazy(() => import('@/pages/admin/Packages'))
const AdminGallery = lazy(() => import('@/pages/admin/Gallery'))
const AdminTestimonials = lazy(() => import('@/pages/admin/Testimonials'))
const AdminPayments = lazy(() => import('@/pages/admin/Payments'))
const AdminBlogs = lazy(() => import('@/pages/admin/Blogs'))
const AdminSettings = lazy(() => import('@/pages/admin/Settings'))
const AdminUsers = lazy(() => import('@/pages/admin/Users'))
const AdminStreams = lazy(() => import('@/pages/admin/Streams'))
const AdminRecordings = lazy(() => import('@/pages/admin/Recordings'))
const AdminOps = lazy(() => import('@/pages/admin/Ops'))
const AdminStudio = lazy(() => import('@/pages/admin/Studio'))
const AdminInvitations = lazy(() => import('@/pages/admin/Invitations'))
const AdminLibrary = lazy(() => import('@/pages/admin/Library'))
const AdminTenants = lazy(() => import('@/pages/admin/Tenants'))
const AdminAnalyticsEnterprise = lazy(() => import('@/pages/admin/AnalyticsEnterprise'))
const AdminCluster = lazy(() => import('@/pages/admin/Cluster'))
const AdminCrm = lazy(() => import('@/pages/admin/Crm'))
const AdminReporting = lazy(() => import('@/pages/admin/Reporting'))
const AdminEventPortal = lazy(() => import('@/pages/admin/EventPortal'))
const AdminThemeBuilder = lazy(() => import('@/pages/admin/ThemeBuilder'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60_000 },
  },
})

function AdminFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-white/50" role="status">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<LandingRedirect />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="portfolio" element={<PortfolioPage />} />
                <Route path="packages" element={<PackagesPage />} />
                <Route path="booking" element={<BookingPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="blog" element={<BlogPage />} />
                <Route path="faq" element={<FaqPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
              </Route>

              <Route path="live/:streamKey" element={<LiveEventPage />} />

              <Route path="dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardOverview />} />
                <Route path="bookings" element={<DashboardBookings />} />
                <Route path="invoices" element={<DashboardInvoices />} />
                <Route path="payments" element={<DashboardPayments />} />
                <Route path="recordings" element={<DashboardRecordings />} />
                <Route path="profile" element={<DashboardProfile />} />
                <Route path="support" element={<DashboardSupport />} />
                <Route path="notifications" element={<DashboardNotifications />} />
              </Route>

              <Route
                path="admin"
                element={
                  <Suspense fallback={<AdminFallback />}>
                    <AdminLayout />
                  </Suspense>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="events" element={<AdminEventPortal />} />
                <Route path="themes" element={<AdminThemeBuilder />} />
                <Route path="streams" element={<AdminStreams />} />
                <Route path="studio" element={<AdminStudio />} />
                <Route path="invitations" element={<AdminInvitations />} />
                <Route path="library" element={<AdminLibrary />} />
                <Route path="tenants" element={<AdminTenants />} />
                <Route path="analytics" element={<AdminAnalyticsEnterprise />} />
                <Route path="cluster" element={<AdminCluster />} />
                <Route path="crm" element={<AdminCrm />} />
                <Route path="reporting" element={<AdminReporting />} />
                <Route path="ops" element={<AdminOps />} />
                <Route path="recordings" element={<AdminRecordings />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="packages" element={<AdminPackages />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}
