import Student from '../models/Student.js'
import Staff from '../models/Staff.js'
import Admission from '../models/Admission.js'
import Payment from '../models/Payment.js'
import Attendance from '../models/Attendance.js'
import Result from '../models/Result.js'

export async function getPublicStats() {
  const [studentsCount, staffCount, admissionsCount] = await Promise.all([
    Student.countDocuments(),
    Staff.countDocuments(),
    Admission.countDocuments(),
  ])

  const passRate = await Result.aggregate([
    { $match: { status: 'published', average: { $gte: 0 } } },
    { $group: { _id: null, avgAverage: { $avg: '$average' }, total: { $sum: 1 } } },
  ]).then((rows) => (rows[0] ? Math.round(rows[0].avgAverage) : null))
    .catch(() => null)

  return {
    students: studentsCount,
    staff: staffCount,
    admissions: admissionsCount,
    passRate,
  }
}

export async function getAdminDashboard() {
  const [studentsCount, staffCount, admissionsCount, paymentsData, attendanceSummary, resultsAgg, recentStudents, recentAdmissions, recentPayments] = await Promise.all([
    Student.countDocuments(),
    Staff.countDocuments(),
    Admission.countDocuments(),
    Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
    ]),
    Attendance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Result.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, avgAverage: { $avg: '$average' }, total: { $sum: 1 } } },
    ]),
    Student.find().sort({ createdAt: -1 }).limit(5).select('studentId fullName status createdAt').lean(),
    Admission.find().sort({ createdAt: -1 }).limit(5).select('applicationNumber applicantName status createdAt').lean(),
    Payment.find().sort({ createdAt: -1 }).limit(5).select('reference amount status purpose createdAt').populate('student', 'studentId fullName').lean(),
  ])

  const revenue = paymentsData.find((p) => p._id === 'successful')?.totalAmount || 0
  const pendingPayments = paymentsData.find((p) => p._id === 'pending')?.count || 0
  const avgScore = resultsAgg[0] ? Math.round(resultsAgg[0].avgAverage) : null

  const attendance = { present: 0, absent: 0, late: 0, excused: 0 }
  attendanceSummary.forEach((row) => { attendance[row._id] = row.count })

  return {
    stats: {
      totalStudents: studentsCount,
      totalStaff: staffCount,
      totalAdmissions: admissionsCount,
      totalRevenue: revenue,
      avgScore,
      pendingPayments,
      attendance,
    },
    recent: { students: recentStudents, admissions: recentAdmissions, payments: recentPayments },
  }
}

export async function getReportsAnalytics() {
  const [paymentsData, resultsAgg, attendanceSummary, studentsByMonth, revenueByMonth, studentsCount, staffCount] = await Promise.all([
    Payment.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
    ]),
    Result.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: null, avgAverage: { $avg: '$average' }, total: { $sum: 1 } } },
    ]),
    Attendance.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Student.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]),
    Payment.aggregate([
      { $match: { status: 'successful' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, amount: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]),
    Student.countDocuments(),
    Staff.countDocuments(),
  ])

  const revenue = paymentsData.find((p) => p._id === 'successful')?.totalAmount || 0
  const avgScore = resultsAgg[0] ? Math.round(resultsAgg[0].avgAverage) : null
  const attendance = { present: 0, absent: 0, late: 0, excused: 0 }
  attendanceSummary.forEach((row) => { attendance[row._id] = row.count })

  const totalAttendance = attendance.present + attendance.absent + attendance.late + attendance.excused
  const attendanceRate = totalAttendance > 0 ? Math.round((attendance.present / totalAttendance) * 100) : null

  return {
    stats: {
      totalRevenue: revenue,
      avgScore,
      attendanceRate,
      totalStudents: studentsCount,
      totalStaff: staffCount,
      totalPayments: paymentsData.reduce((sum, p) => sum + p.count, 0),
      successfulPayments: paymentsData.find((p) => p._id === 'successful')?.count || 0,
      failedPayments: paymentsData.find((p) => p._id === 'failed')?.count || 0,
    },
    trends: {
      enrollment: studentsByMonth.map((item) => ({ month: item._id, students: item.count })),
      revenue: revenueByMonth.map((item) => ({ month: item._id, amount: item.amount })),
    },
  }
}
