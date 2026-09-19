import { QRCodeSVG } from 'qrcode.react'
import QRCode from 'qrcode'
import { Download, Printer } from 'lucide-react'
import { useRef, useState } from 'react'

type Student = {
  studentId: string
  admissionNumber: string
  fullName: string
  photoUrl?: string
  session?: string
  status: string
  classRef?: { name: string }
  verificationToken: string
  gender?: string
  dateOfBirth?: string
  bloodGroup?: string
  address?: string
  phone?: string
  guardianName?: string
  guardianPhone?: string
  issueDate?: string
  expiryDate?: string
}

type Result = {
  term?: { name: string }
  session?: { name: string }
  average?: number
  attendance?: { present: number; total: number }
  teacherRemark?: string
  principalRemark?: string
  subjects?: { subject?: { name: string }; ca?: number; exam?: number; total?: number; grade?: string; remark?: string }[]
}

export function StudentIdCard({ student }: { student: Student }) {
  const verificationUrl = `${window.location.origin}/verify/student/${student.verificationToken}`
  const [imageLoaded, setImageLoaded] = useState(false)
  const photoRef = useRef<HTMLImageElement>(null)

  const generateQRDataUrl = async (): Promise<string> => {
    return QRCode.toDataURL(verificationUrl, {
      width: 300,
      margin: 1,
      color: {
        dark: '#1a3a2a',
        light: '#ffffff',
      },
    })
  }

  const download = async () => {
    const { default: jsPDF } = await import('jspdf')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98],
    })

    const pageWidth = 85.6
    const pageHeight = 53.98
    const margin = 3

    // White background
    pdf.setFillColor(255, 255, 255)
    pdf.rect(0, 0, pageWidth, pageHeight, 'F')

    // Decorative top border
    pdf.setFillColor(26, 58, 42)
    pdf.rect(0, 0, pageWidth, 2, 'F')

    // School header
    pdf.setTextColor(26, 58, 42)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('NORTHBRIDGE INTERNATIONAL SCHOOL', pageWidth / 2, 8, { align: 'center' })
    pdf.setFontSize(6)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    pdf.text('Excellence in Education', pageWidth / 2, 11.5, { align: 'center' })

    // Left side - Photo
    const photoX = margin + 3
    const photoY = 14
    const photoSize = 26

    pdf.setDrawColor(200, 200, 200)
    pdf.setLineWidth(0.3)
    pdf.roundedRect(photoX, photoY, photoSize, photoSize, 1.5, 1.5, 'S')
    pdf.setFillColor(245, 245, 245)
    pdf.roundedRect(photoX, photoY, photoSize, photoSize, 1.5, 1.5, 'F')

    if (student.photoUrl && imageLoaded) {
      try {
        pdf.addImage(student.photoUrl, 'JPEG', photoX + 0.5, photoY + 0.5, photoSize - 1, photoSize - 1, undefined, 'FAST')
      } catch {
        drawInitials(pdf, student.fullName, photoX, photoY, photoSize)
      }
    } else {
      drawInitials(pdf, student.fullName, photoX, photoY, photoSize)
    }

    // Right side - Details
    const detailsX = photoX + photoSize + 5
    const startY = photoY + 3

    pdf.setTextColor(60, 60, 60)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text(student.fullName, detailsX, startY)

    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)

    const details = [
      { label: 'Student ID', value: student.studentId },
      { label: 'Admission', value: student.admissionNumber },
      { label: 'Class', value: student.classRef?.name || 'N/A' },
      { label: 'Session', value: student.session || 'Current' },
      { label: 'Status', value: student.status },
    ]

    details.forEach((item, index) => {
      const y = startY + 5 + index * 3.8
      pdf.setTextColor(130, 130, 130)
      pdf.setFontSize(5.5)
      pdf.setFont('helvetica', 'bold')
      pdf.text(item.label.toUpperCase(), detailsX, y)
      pdf.setTextColor(60, 60, 60)
      pdf.setFontSize(7)
      pdf.setFont('helvetica', 'normal')
      pdf.text(item.value, detailsX + 22, y)
    })

    // QR Code
    const qrSize = 16
    const qrX = pageWidth - margin - qrSize - 3
    const qrY = pageHeight - qrSize - 14

    try {
      const qrDataUrl = await generateQRDataUrl()
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)
      pdf.setFontSize(5)
      pdf.setTextColor(150, 150, 150)
      pdf.text('Scan to verify', qrX + qrSize / 2, qrY + qrSize + 2, { align: 'center' })
    } catch {
      pdf.setDrawColor(200, 200, 200)
      pdf.rect(qrX, qrY, qrSize, qrSize)
      pdf.setFontSize(5)
      pdf.setTextColor(150, 150, 150)
      pdf.text('QR Code', qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' })
    }

    // Bottom bar
    pdf.setFillColor(245, 245, 245)
    pdf.rect(0, pageHeight - 12, pageWidth, 12, 'F')
    pdf.setDrawColor(220, 220, 220)
    pdf.setLineWidth(0.2)
    pdf.line(0, pageHeight - 12, pageWidth, pageHeight - 12)

    pdf.setTextColor(100, 100, 100)
    pdf.setFontSize(6)
    pdf.setFont('helvetica', 'normal')
    const issueDate = student.issueDate ? new Date(student.issueDate).toLocaleDateString() : new Date().toLocaleDateString()
    const expiryDate = student.expiryDate ? new Date(student.expiryDate).toLocaleDateString() : 'Indefinite'
    pdf.text(`Issued: ${issueDate}`, margin + 3, pageHeight - 7)
    pdf.text(`Expires: ${expiryDate}`, margin + 35, pageHeight - 7)
    pdf.text(`Phone: ${student.phone || 'N/A'}`, margin + 3, pageHeight - 3)

    // Signature line
    pdf.setDrawColor(150, 150, 150)
    pdf.setLineWidth(0.2)
    pdf.line(pageWidth - margin - 35, pageHeight - 8, pageWidth - margin - 3, pageHeight - 8)
    pdf.setTextColor(130, 130, 130)
    pdf.setFontSize(5.5)
    pdf.text('Authorized Signature', pageWidth - margin - 19, pageHeight - 5, { align: 'center' })

    // Verification URL at very bottom
    pdf.setTextColor(180, 180, 180)
    pdf.setFontSize(4.5)
    pdf.text(verificationUrl, pageWidth / 2, pageHeight - 0.8, { align: 'center' })

    pdf.save(`${student.studentId}-id-card.pdf`)
  }

  const details = [
    { label: 'Student ID', value: student.studentId },
    { label: 'Admission No.', value: student.admissionNumber },
    { label: 'Class', value: student.classRef?.name || 'N/A' },
    { label: 'Session', value: student.session || 'Current' },
    { label: 'Status', value: student.status },
    { label: 'Gender', value: student.gender || 'N/A' },
    { label: 'Date of Birth', value: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A' },
    { label: 'Blood Group', value: student.bloodGroup || 'N/A' },
    { label: 'Phone', value: student.phone || 'N/A' },
    { label: 'Guardian', value: student.guardianName || 'N/A' },
    { label: 'Guardian Phone', value: student.guardianPhone || 'N/A' },
  ]

  return (
    <div className="max-w-2xl">
      <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-xl border border-[#1a3a2a] bg-white shadow-xl">
        <div className="bg-[#1a3a2a] px-4 py-2.5 text-center">
          <h3 className="font-display text-sm font-bold tracking-wide text-white">NORTHBRIDGE INTERNATIONAL SCHOOL</h3>
          <p className="text-[10px] text-white/70">Excellence in Education</p>
        </div>

        <div className="flex gap-4 p-4">
          <div className="flex-shrink-0">
            <div className="h-28 w-24 overflow-hidden rounded-lg border border-[#d8d9d0] bg-[#f5f3ed]">
              {student.photoUrl ? (
                <img
                  ref={photoRef}
                  src={student.photoUrl}
                  alt={student.fullName}
                  className="h-full w-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#1a3a2a] text-2xl font-bold text-white">
                  {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-display text-lg font-bold text-[#1a3a2a] leading-tight">{student.fullName}</h4>
            <div className="mt-2 space-y-1">
              {details.slice(1, 6).map(item => (
                <div key={item.label} className="flex justify-between text-xs">
                  <span className="text-[#69736c]">{item.label}</span>
                  <span className="font-medium text-[#1a3a2a]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#d8d9d0] bg-[#f5f3ed] px-4 py-3">
          <div>
            <p className="text-[10px] text-[#69736c]">Issued: {new Date().toLocaleDateString()}</p>
            <p className="text-[10px] text-[#69736c]">Valid: {student.expiryDate ? new Date(student.expiryDate).toLocaleDateString() : 'Indefinite'}</p>
          </div>
          <div className="text-center">
            <QRCodeSVG value={verificationUrl} size={52} level="M" includeMargin />
            <p className="mt-1 text-[8px] text-[#69736c]">Scan to verify</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={download}
          className="flex items-center gap-2 bg-[#1a3a2a] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#1a3a2a]/90"
        >
          <Download size={14} />
          Download PDF
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 border border-[#d8d9d0] px-4 py-2.5 text-xs font-medium text-[#69736c] hover:border-[#1a3a2a] hover:text-[#1a3a2a]"
        >
          <Printer size={14} />
          Print
        </button>
      </div>
    </div>
  )
}

function drawInitials(pdf: any, fullName: string, x: number, y: number, size: number) {
  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2)
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.text(initials, x + size / 2, y + size / 2 + 0.5, { align: 'center' })
}

export function ResultSheet({ student, result }: { student: Student; result: Result }) {
  const download = async () => {
    const { default: jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - margin * 2

    pdf.setFillColor(26, 58, 42)
    pdf.rect(0, 0, pageWidth, 40, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(16)
    pdf.text('NORTHBRIDGE INTERNATIONAL SCHOOL', pageWidth / 2, 18, { align: 'center' })
    pdf.setFontSize(9)
    pdf.text('Academic Result Sheet', pageWidth / 2, 25, { align: 'center' })

    pdf.setTextColor(34, 50, 44)
    pdf.setFontSize(10)
    pdf.text(`Student: ${student.fullName}`, margin, 50)
    pdf.text(`ID: ${student.studentId}`, margin, 58)
    pdf.text(`Admission: ${student.admissionNumber}`, margin, 66)
    pdf.text(`Class: ${student.classRef?.name || 'Student'}`, margin + 80, 50)
    pdf.text(`Session: ${result.session?.name || 'Current'}`, margin + 80, 58)
    pdf.text(`Term: ${result.term?.name || 'Current'}`, margin + 80, 66)

    pdf.setFillColor(245, 249, 246)
    pdf.rect(margin, 78, contentWidth, 10, 'F')
    pdf.setTextColor(26, 58, 42)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Subject', margin + 4, 84)
    pdf.text('CA', margin + 70, 84)
    pdf.text('Exam', margin + 90, 84)
    pdf.text('Total', margin + 110, 84)
    pdf.text('Grade', margin + 130, 84)

    let y = 94
    ;(result.subjects || []).forEach((subject) => {
      pdf.setTextColor(60, 60, 60)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`${subject.subject?.name || 'Subject'}`, margin + 4, y)
      pdf.text(`${subject.ca ?? '-'}`, margin + 70, y)
      pdf.text(`${subject.exam ?? '-'}`, margin + 90, y)
      pdf.text(`${subject.total ?? '-'}`, margin + 110, y)
      pdf.text(`${subject.grade || '-'}`, margin + 130, y)
      y += 8
    })

    pdf.setDrawColor(26, 58, 42)
    pdf.setLineWidth(0.5)
    pdf.line(margin, y + 4, pageWidth - margin, y + 4)

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(60, 60, 60)
    pdf.text(`Average: ${result.average ?? '-'}%`, margin, y + 14)
    pdf.text(`Attendance: ${result.attendance?.present ?? '-'} / ${result.attendance?.total ?? '-'} days`, margin + 70, y + 14)
    pdf.text(`Teacher Remark: ${result.teacherRemark || 'N/A'}`, margin, y + 24)
    pdf.text(`Principal Remark: ${result.principalRemark || 'N/A'}`, margin, y + 32)

    pdf.save(`${student.studentId}-result.pdf`)
  }

  return (
    <section className="border border-[#d8d9d0] bg-white p-5 text-ink">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[.15em] text-forest">Academic result</p>
          <h3 className="mt-1 font-display text-2xl">{student.fullName}</h3>
          <p className="text-xs text-[#69736c]">{result.session?.name || 'Current session'} · {result.term?.name || 'Current term'}</p>
        </div>
        <strong className="font-display text-3xl text-forest">{result.average ?? '-'}%</strong>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[500px] text-left text-xs">
          <thead className="border-y border-[#d8d9d0] text-[#69736c]">
            <tr>
              <th className="py-2">Subject</th>
              <th>CA</th>
              <th>Exam</th>
              <th>Total</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {(result.subjects || []).map((subject) => (
              <tr key={subject.subject?.name} className="border-b border-[#d8d9d0]">
                <td className="py-2">{subject.subject?.name || 'Subject'}</td>
                <td>{subject.ca ?? '-'}</td>
                <td>{subject.exam ?? '-'}</td>
                <td>{subject.total ?? '-'}</td>
                <td className="font-semibold text-forest">{subject.grade || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-[#69736c]">Attendance: {result.attendance?.present ?? '-'} / {result.attendance?.total ?? '-'} days</p>
      <p className="mt-1 text-xs text-[#69736c]">Teacher: {result.teacherRemark || 'N/A'}</p>
      <p className="mt-1 text-xs text-[#69736c]">Principal: {result.principalRemark || 'N/A'}</p>
      <button className="mt-5 flex items-center gap-2 bg-forest px-3 py-2 text-xs text-white hover:bg-forest/90" onClick={download}>
        <Download size={14} />
        Download result PDF
      </button>
    </section>
  )
}
