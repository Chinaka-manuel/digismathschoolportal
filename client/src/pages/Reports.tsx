import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { IndianRupee, Users, ClipboardList, TrendingUp, Wallet, UsersRound } from 'lucide-react'
import { reportService } from '../services/reportService'

type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'termly' | 'yearly'

type ReportCardProps = {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
}

function ReportCard({ title, value, change, icon }: ReportCardProps) {
  return (
    <div className="border border-[#d8d9d0] bg-white/40 p-5">
      <div className="mb-4 flex items-start justify-between">
        <span className="text-sm text-[#69736c]">{title}</span>
        <span className="text-forest">{icon}</span>
      </div>
      <strong className="font-display text-3xl">{value}</strong>
      {change && <p className="mt-1 text-xs text-[#69736c]">{change}</p>}
    </div>
  )
}

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>('monthly')

  const { data, isLoading, error } = useQuery({ queryKey: ['reports-analytics'], queryFn: reportService.getAnalytics })

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`
    return `₦${value}`
  }

  const stats = data?.stats ? [
    { title: 'Total Revenue', value: formatCurrency(data.stats.totalRevenue), change: data.stats.successfulPayments > 0 ? `${data.stats.successfulPayments} successful payments` : 'No payments yet', icon: <IndianRupee size={20} /> },
    { title: 'Total Students', value: data.stats.totalStudents?.toString() ?? '--', change: 'Enrolled students', icon: <Users size={20} /> },
    { title: 'Average Attendance', value: data.stats.attendanceRate != null ? `${data.stats.attendanceRate}%` : '--', change: 'Based on recorded attendance', icon: <ClipboardList size={20} /> },
    { title: 'Average Score', value: data.stats.avgScore != null ? `${data.stats.avgScore}%` : '--', change: 'From published results', icon: <TrendingUp size={20} /> },
    { title: 'Fee Collection', value: data.stats.totalPayments > 0 ? `${Math.round((data.stats.successfulPayments / data.stats.totalPayments) * 100)}%` : '--', change: `${data.stats.failedPayments || 0} failed payments`, icon: <Wallet size={20} /> },
    { title: 'Staff Count', value: data.stats.totalStaff?.toString() ?? '--', change: 'Active staff members', icon: <UsersRound size={20} /> },
  ] : []

  const enrollmentData = (data?.trends?.enrollment ?? []).map((item) => ({
    month: item.month,
    students: item.students,
  }))

  const maxEnrollment = Math.max(...enrollmentData.map((d) => d.students), 1)

  const revenueData = (data?.trends?.revenue ?? []).map((item) => ({
    month: item.month,
    amount: item.amount,
  }))

  const maxRevenue = Math.max(...revenueData.map((d) => d.amount), 1)

  return (
    <div>
      <Helmet>
        <title>Reports | Northbridge International School</title>
      </Helmet>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#69736c]">Analytics and insights</p>
          <h2 className="mt-1 font-display text-4xl">Reports</h2>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
          className="border border-[#d8d9d0] bg-transparent px-3 py-2 text-sm outline-none focus:border-forest"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="termly">Termly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {isLoading && <p className="text-sm text-[#69736c]">Loading reports...</p>}
      {error && <p className="text-sm text-red-700">Unable to load reports.</p>}

      {!isLoading && !error && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <ReportCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="border border-[#d8d9d0] bg-white/40 p-6">
              <h3 className="font-display text-2xl">Enrollment Trend</h3>
              <p className="text-sm text-[#69736c]">Student enrollment over the last 6 months</p>
              {enrollmentData.length === 0 ? (
                <p className="mt-6 text-sm text-[#69736c]">No enrollment data available yet.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {enrollmentData.map((item) => (
                    <div key={item.month} className="flex items-center gap-4">
                      <span className="w-10 text-xs text-[#69736c]">{item.month}</span>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-[#e5e9dd]">
                          <div className="h-2 rounded-full bg-forest" style={{ width: `${(item.students / maxEnrollment) * 100}%` }} />
                        </div>
                      </div>
                      <span className="w-12 text-right text-sm font-medium">{item.students}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-[#d8d9d0] bg-white/40 p-6">
              <h3 className="font-display text-2xl">Revenue Overview</h3>
              <p className="text-sm text-[#69736c]">Payment collection over the last 6 months</p>
              {revenueData.length === 0 ? (
                <p className="mt-6 text-sm text-[#69736c]">No revenue data available yet.</p>
              ) : (
                <div className="mt-6 space-y-3">
                  {revenueData.map((item) => (
                    <div key={item.month} className="flex items-center gap-4">
                      <span className="w-10 text-xs text-[#69736c]">{item.month}</span>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-[#e5e9dd]">
                          <div className="h-2 rounded-full bg-sun" style={{ width: `${(item.amount / maxRevenue) * 100}%` }} />
                        </div>
                      </div>
                      <span className="w-20 text-right text-sm font-medium">₦{(item.amount / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
