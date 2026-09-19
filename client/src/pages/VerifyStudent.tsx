import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../api/client'

type StudentProfile = { fullName: string; studentId: string; photoUrl?: string; status: string }

export default function VerifyStudent() {
  const { token } = useParams<{ token: string }>()
  const { data, isLoading, error } = useQuery({ queryKey: ['verify-student', token], queryFn: async () => (await api.get(`/v1/verify/student/${token}`)).data, enabled: Boolean(token) })
  const profile = data?.data as StudentProfile | undefined

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#cbd8c8] px-5 text-sm text-[#69736c]">Verifying...</div>
  if (error || !profile) return <div className="flex min-h-screen items-center justify-center bg-[#cbd8c8] px-5 text-sm text-red-700">Invalid or expired verification link.</div>

  return (
    <div className="min-h-screen bg-[#cbd8c8] px-5 py-16">
      <div className="mx-auto max-w-lg bg-paper p-8 text-ink shadow-2xl">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">Student verification</p>
        <h1 className="mt-2 font-display text-4xl">Verified</h1>
        <p className="mt-2 text-sm text-[#69736c]">This student is currently active at Northbridge International School.</p>
        <div className="mt-8 flex items-center gap-6">
          {profile.photoUrl && <img src={profile.photoUrl} alt="" className="h-20 w-20 rounded-full object-cover" />}
          <div>
            <p className="font-display text-2xl">{profile.fullName}</p>
            <p className="text-sm text-[#69736c]">ID: {profile.studentId}</p>
            <p className="text-sm text-[#69736c]">Status: {profile.status}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-[10px] uppercase tracking-[.15em] text-forest">Verification QR</p>
          <div className="rounded-xl border border-[#d8d9d0] p-4">
            <QRCodeSVG value={JSON.stringify({ name: profile.fullName, id: profile.studentId, school: 'Northbridge International School' })} size={160} />
          </div>
          <p className="text-xs text-[#69736c]">Scan to verify student identity</p>
        </div>
      </div>
    </div>
  )
}
