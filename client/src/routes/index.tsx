import { Suspense, lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from '../components/PublicLayout'
import PortalLayout from '../components/PortalLayout'
import AdminLayout from '../components/AdminLayout'
import StaffLayout from '../components/StaffLayout'
import ParentLayout from '../components/ParentLayout'
import ProtectedRoute from '../components/ProtectedRoute'

const Loading = () => <div className="flex min-h-screen items-center justify-center text-sm text-[#69736c]">Loading…</div>

const LazyHome = lazy(() => import('../pages/Home'))
const LazyAbout = lazy(() => import('../pages/About'))
const LazyAcademics = lazy(() => import('../pages/Academics'))
const LazyAdmissions = lazy(() => import('../pages/Admissions'))
const LazyAdmissionForm = lazy(() => import('../pages/AdmissionForm'))
const LazyNews = lazy(() => import('../pages/News'))
const LazyNewsDetail = lazy(() => import('../pages/NewsDetail'))
const LazyGallery = lazy(() => import('../pages/Gallery'))
const LazyCalendar = lazy(() => import('../pages/Calendar'))
const LazyDownloads = lazy(() => import('../pages/Downloads'))
const LazyContact = lazy(() => import('../pages/Contact'))
const LazyLogin = lazy(() => import('../pages/Login'))
const LazySignup = lazy(() => import('../pages/Signup'))
const LazyVerifyStudent = lazy(() => import('../pages/VerifyStudent'))
const LazyPortalDashboard = lazy(() => import('../pages/PortalDashboard'))
const LazyPortalProfile = lazy(() => import('../pages/PortalProfile'))
const LazyPortalResults = lazy(() => import('../pages/PortalResults'))
const LazyPortalIdCard = lazy(() => import('../pages/PortalIdCard'))
const LazyPortalNotifications = lazy(() => import('../pages/PortalNotifications'))
const LazyPortalPayments = lazy(() => import('../pages/PortalPayments'))
const LazyAdminDashboard = lazy(() => import('../pages/AdminDashboard'))
const LazyAdminStudents = lazy(() => import('../pages/AdminStudents'))
const LazyAdminStaff = lazy(() => import('../pages/AdminStaff'))
const LazyAdminAdmissions = lazy(() => import('../pages/AdminAdmissions'))
const LazyAdminPayments = lazy(() => import('../pages/AdminPayments'))
const LazyAdminSettings = lazy(() => import('../pages/AdminSettings'))
const LazyAdminAuditLogs = lazy(() => import('../pages/AdminAuditLogs'))
const LazyReports = lazy(() => import('../pages/Reports'))
const LazyStaffDashboard = lazy(() => import('../pages/StaffDashboard'))
const LazyStaffClasses = lazy(() => import('../pages/StaffClasses'))
const LazyStaffStudents = lazy(() => import('../pages/StaffStudents'))
const LazyStaffResults = lazy(() => import('../pages/StaffResults'))
const LazyStaffAttendance = lazy(() => import('../pages/StaffAttendance'))
const LazyParentDashboard = lazy(() => import('../pages/ParentDashboard'))
const LazyParentChildren = lazy(() => import('../pages/ParentChildren'))
const LazyParentResults = lazy(() => import('../pages/ParentResults'))
const LazyParentFees = lazy(() => import('../pages/ParentFees'))

function lazyWrap(Component: React.LazyExoticComponent<React.ComponentType<any>>) {
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: lazyWrap(LazyHome) },
      { path: 'about', element: lazyWrap(LazyAbout) },
      { path: 'academics', element: lazyWrap(LazyAcademics) },
      { path: 'admissions', element: lazyWrap(LazyAdmissions) },
      { path: 'admissions/apply', element: lazyWrap(LazyAdmissionForm) },
      { path: 'news', element: lazyWrap(LazyNews) },
      { path: 'news/:slug', element: lazyWrap(LazyNewsDetail) },
      { path: 'gallery', element: lazyWrap(LazyGallery) },
      { path: 'calendar', element: lazyWrap(LazyCalendar) },
      { path: 'downloads', element: lazyWrap(LazyDownloads) },
      { path: 'contact', element: lazyWrap(LazyContact) },
      { path: 'login', element: lazyWrap(LazyLogin) },
      { path: 'signup', element: lazyWrap(LazySignup) },
      { path: 'verify/student/:token', element: lazyWrap(LazyVerifyStudent) },
    ],
  },
  {
    path: 'portal',
    element: (
      <ProtectedRoute>
        <PortalLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: lazyWrap(LazyPortalDashboard) },
      { path: 'profile', element: lazyWrap(LazyPortalProfile) },
      { path: 'results', element: lazyWrap(LazyPortalResults) },
      { path: 'id-card', element: lazyWrap(LazyPortalIdCard) },
      { path: 'notifications', element: lazyWrap(LazyPortalNotifications) },
      { path: 'payments', element: lazyWrap(LazyPortalPayments) },
    ],
  },
  {
    path: 'admin',
    element: (
      <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: lazyWrap(LazyAdminDashboard) },
      { path: 'students', element: lazyWrap(LazyAdminStudents) },
      { path: 'staff', element: lazyWrap(LazyAdminStaff) },
      { path: 'admissions', element: lazyWrap(LazyAdminAdmissions) },
      { path: 'payments', element: lazyWrap(LazyAdminPayments) },
      { path: 'settings', element: lazyWrap(LazyAdminSettings) },
      { path: 'audit-logs', element: lazyWrap(LazyAdminAuditLogs) },
      { path: 'reports', element: lazyWrap(LazyReports) },
    ],
  },
  {
    path: 'staff',
    element: (
      <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF']}>
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: lazyWrap(LazyStaffDashboard) },
      { path: 'classes', element: lazyWrap(LazyStaffClasses) },
      { path: 'students', element: lazyWrap(LazyStaffStudents) },
      { path: 'results', element: lazyWrap(LazyStaffResults) },
      { path: 'attendance', element: lazyWrap(LazyStaffAttendance) },
    ],
  },
  {
    path: 'parent',
    element: (
      <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'PARENT', 'GUARDIAN']}>
        <ParentLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: lazyWrap(LazyParentDashboard) },
      { path: 'children', element: lazyWrap(LazyParentChildren) },
      { path: 'results', element: lazyWrap(LazyParentResults) },
      { path: 'fees', element: lazyWrap(LazyParentFees) },
    ],
  },
])
