import { useQuery } from '@tanstack/react-query'
import { ArrowDownToLine } from 'lucide-react'
import { api } from '../api/client'
import { Seo } from '../components/Seo'

type Download = { _id: string; title: string; description?: string; fileUrl: string; mimeType: string; category?: string }

export default function Downloads() {
  const { data, isLoading, error } = useQuery({ queryKey: ['public-downloads'], queryFn: async () => (await api.get('/v1/downloads')).data })
  const downloads = (data?.data ?? []) as Download[]

  if (isLoading) return <div className="px-[5.5%] py-16 text-sm text-[#69736c]">Loading resources...</div>
  if (error) return <div className="px-[5.5%] py-16 text-sm text-red-700">Unable to load downloads.</div>

  return (
    <div className="px-[5.5%] py-16 max-sm:px-[8%]">
      <Seo title="Downloads" path="/downloads" />
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 07 &nbsp; Resources</p>
        <h1 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">Downloads</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {downloads.map((item) => (
          <div key={item._id} className="flex items-start justify-between gap-4 border-t border-[#d8d9d0] pt-4">
            <div>
              {item.category && <span className="text-[10px] uppercase tracking-wider text-forest">{item.category}</span>}
              <h3 className="font-display text-xl">{item.title}</h3>
              {item.description && <p className="mt-1 text-sm text-[#69736c]">{item.description}</p>}
            </div>
            <a href={item.fileUrl} target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-2 border-b border-forest pb-1 text-sm text-forest"><ArrowDownToLine size={15} /> Download</a>
          </div>
        ))}
        {downloads.length === 0 && <p className="text-sm text-[#69736c]">No downloads available right now.</p>}
      </div>
    </div>
  )
}
