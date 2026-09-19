import { useQuery } from '@tanstack/react-query'
import { User } from 'lucide-react'
import { useRef, useState } from 'react'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

export default function PortalProfile() {
  const { user, updateUser } = useAuthStore()
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const profileInput = useRef<HTMLInputElement>(null)
  const ownedStudents = useQuery({ queryKey: ['students', 'owned'], queryFn: async () => (await api.get('/v1/students/me')).data })
  const uploadProfileImage = async (file?: File) => { if (!file) return; setUploadingProfile(true); try { const form = new FormData(); form.append('image', file); const { data } = await api.post('/v1/uploads/profile-image', form, { headers: { 'Content-Type': 'multipart/form-data' } }); updateUser({ profileImageUrl: data.data.url }) } finally { setUploadingProfile(false) } }
  return (
    <div>
      <h2 className="font-display text-4xl">Your profile</h2>
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col items-center gap-4">
          <label className="group relative grid h-28 w-28 cursor-pointer place-items-center overflow-hidden rounded-full bg-forest text-2xl text-white">
            <input ref={profileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void uploadProfileImage(e.target.files?.[0])} />
            {user?.profileImageUrl ? <img className="h-full w-full object-cover" src={user.profileImageUrl} alt={`${user.name} profile`} /> : user?.name?.[0] || 'U'}
            {uploadingProfile && <span className="absolute inset-0 grid place-items-center bg-forest/80 text-[10px]">...</span>}
          </label>
          <p className="text-xs text-[#69736c]">Click to update photo</p>
        </div>
        <div className="space-y-4 border border-[#d8d9d0] bg-white/40 p-6">
          <div><p className="text-[10px] uppercase tracking-[.15em] text-forest">Full name</p><p className="mt-1 text-sm">{user?.name}</p></div>
          <div><p className="text-[10px] uppercase tracking-[.15em] text-forest">Email</p><p className="mt-1 text-sm">{user?.email}</p></div>
          <div><p className="text-[10px] uppercase tracking-[.15em] text-forest">Role</p><p className="mt-1 text-sm">{user?.role}</p></div>
        </div>
      </div>
      {ownedStudents.data?.data?.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-2xl">Linked students</h3>
          <div className="mt-4 space-y-3">
            {ownedStudents.data.data.map((s: any) => (
              <div key={s.studentId} className="flex items-center gap-3 border border-[#d8d9d0] bg-white/40 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-forest/10 text-forest"><User size={18} /></span>
                <div><p className="text-sm font-medium">{s.fullName}</p><p className="text-xs text-[#69736c]">{s.classRef?.name || '—'} · {s.status}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
