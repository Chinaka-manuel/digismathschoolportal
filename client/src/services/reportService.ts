import { api } from '../api/client'

export type PublicStats = {
  students: number
  staff: number
  admissions: number
  passRate: number | null
}

export type AdminDashboard = {
  stats: {
    totalStudents: number
    totalStaff: number
    totalAdmissions: number
    totalRevenue: number
    avgScore: number | null
    pendingPayments: number
    attendance: { present: number; absent: number; late: number; excused: number }
  }
  recent: {
    students: Array<{ studentId: string; fullName: string; status: string; createdAt: string }>
    admissions: Array<{ applicationNumber: string; applicantName: string; status: string; createdAt: string }>
    payments: Array<{ reference: string; amount: number; status: string; purpose: string; createdAt: string; student?: { studentId: string; fullName: string } }>
  }
}

export type ReportsAnalytics = {
  stats: {
    totalRevenue: number
    avgScore: number | null
    attendanceRate: number | null
    totalStudents: number
    totalStaff: number
    totalPayments: number
    successfulPayments: number
    failedPayments: number
  }
  trends: {
    enrollment: Array<{ month: string; students: number }>
    revenue: Array<{ month: string; amount: number }>
  }
}

export const reportService = {
  getPublicStats: () => api.get('/v1/reports/public').then((res) => res.data.data as PublicStats),
  getAdminDashboard: () => api.get('/v1/reports/dashboard').then((res) => res.data.data as AdminDashboard),
  getAnalytics: () => api.get('/v1/reports/analytics').then((res) => res.data.data as ReportsAnalytics),
}
