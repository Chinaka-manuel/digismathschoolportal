import { useQuery } from '@tanstack/react-query'
import { StudentIdCard } from '../components/StudentDocuments'
import { api } from '../api/client'

export default function PortalIdCard() {
  const { data } = useQuery({ queryKey: ['students', 'owned'], queryFn: async () => (await api.get('/v1/students/me')).data })
  return (
    <div>
      <h2 className="font-display text-4xl">ID Card</h2>
      <p className="mt-2 text-sm text-[#69736c]">Download or print your digital student ID.</p>
      <div className="mt-8 space-y-6">
        {data?.data?.map((student: any) => (
          <StudentIdCard key={student.studentId} student={student} />
        ))}
        {!data?.data?.length && <p className="text-sm text-[#69736c]">No student records found.</p>}
      </div>
    </div>
  )
}
