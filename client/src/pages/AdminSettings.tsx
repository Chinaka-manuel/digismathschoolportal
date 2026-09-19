import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../api/client'
import { useAuthStore } from '../stores/authStore'

const adminRoles = ['SUPER_ADMIN', 'ADMIN']

const settingsSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('A valid email is required'),
  description: z.string().min(1, 'Description is required'),
  mission: z.string().min(1, 'Mission is required'),
  vision: z.string().min(1, 'Vision is required'),
  whatsappNumber: z.string().min(1, 'WhatsApp number is required'),
  socialLinks: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function AdminSettings() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const canAccess = adminRoles.includes(user?.role || '')
  const [serverError, setServerError] = useState('')
  const [serverSuccess, setServerSuccess] = useState('')

  const settingsQuery = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => (await api.get('/v1/settings/public')).data,
    enabled: canAccess,
  })

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: settingsQuery.data?.data ? {
      schoolName: settingsQuery.data.data.schoolName || '',
      address: settingsQuery.data.data.address || '',
      phone: settingsQuery.data.data.phone || '',
      email: settingsQuery.data.data.email || '',
      description: settingsQuery.data.data.description || '',
      mission: settingsQuery.data.data.mission || '',
      vision: settingsQuery.data.data.vision || '',
      whatsappNumber: settingsQuery.data.data.whatsappNumber || '',
      socialLinks: Array.isArray(settingsQuery.data.data.socialLinks) ? JSON.stringify(settingsQuery.data.data.socialLinks) : '',
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: async (values: SettingsFormData) => {
      const payload: Record<string, unknown> = { ...values }
      if (values.socialLinks) {
        try { payload.socialLinks = JSON.parse(values.socialLinks) } catch { payload.socialLinks = values.socialLinks }
      } else {
        payload.socialLinks = []
      }
      return (await api.patch('/v1/settings', payload)).data
    },
    onSuccess: () => {
      setServerSuccess('Settings updated successfully.')
      setServerError('')
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
    onError: () => {
      setServerError('Unable to update settings. Please try again.')
      setServerSuccess('')
    },
  })

  if (!canAccess) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-red-700">You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm text-[#69736c]">Configuration</p>
          <h2 className="mt-1 font-display text-4xl">Settings</h2>
        </div>
      </div>
      <form className="max-w-2xl space-y-5" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <div>
          <label className="block text-sm">School Name</label>
          <input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" {...register('schoolName')} />
          {errors.schoolName && <span className="mt-1 block text-xs text-red-700">{errors.schoolName.message}</span>}
        </div>
        <div>
          <label className="block text-sm">Address</label>
          <input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" {...register('address')} />
          {errors.address && <span className="mt-1 block text-xs text-red-700">{errors.address.message}</span>}
        </div>
        <div>
          <label className="block text-sm">Phone</label>
          <input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" {...register('phone')} />
          {errors.phone && <span className="mt-1 block text-xs text-red-700">{errors.phone.message}</span>}
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" type="email" {...register('email')} />
          {errors.email && <span className="mt-1 block text-xs text-red-700">{errors.email.message}</span>}
        </div>
        <div>
          <label className="block text-sm">WhatsApp Number</label>
          <input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" {...register('whatsappNumber')} />
          {errors.whatsappNumber && <span className="mt-1 block text-xs text-red-700">{errors.whatsappNumber.message}</span>}
        </div>
        <div>
          <label className="block text-sm">Social Links (JSON)</label>
          <textarea className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" rows={3} placeholder='[{"platform":"Facebook","url":"https://..."}]' {...register('socialLinks')} />
          {errors.socialLinks && <span className="mt-1 block text-xs text-red-700">{errors.socialLinks.message}</span>}
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" rows={3} {...register('description')} />
          {errors.description && <span className="mt-1 block text-xs text-red-700">{errors.description.message}</span>}
        </div>
        <div>
          <label className="block text-sm">Mission</label>
          <textarea className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" rows={2} {...register('mission')} />
          {errors.mission && <span className="mt-1 block text-xs text-red-700">{errors.mission.message}</span>}
        </div>
        <div>
          <label className="block text-sm">Vision</label>
          <textarea className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" rows={2} {...register('vision')} />
          {errors.vision && <span className="mt-1 block text-xs text-red-700">{errors.vision.message}</span>}
        </div>
        {serverError && <p className="text-sm text-red-700">{serverError}</p>}
        {serverSuccess && <p className="text-sm text-forest">{serverSuccess}</p>}
        <button className="flex w-full items-center justify-between bg-forest px-4 py-4 text-xs uppercase tracking-[.08em] text-white disabled:opacity-60" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Saving...' : 'Save settings'}
        </button>
      </form>
    </div>
  )
}
