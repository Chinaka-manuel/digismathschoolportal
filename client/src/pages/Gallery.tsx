import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { api } from '../api/client'
import { Seo } from '../components/Seo'

type GalleryItem = { _id: string; title?: string; mediaUrl: string; kind: 'image' | 'video'; category?: string }

export default function Gallery() {
  const { data, isLoading, error } = useQuery({ queryKey: ['public-gallery'], queryFn: async () => (await api.get('/v1/gallery')).data })
  const items = (data?.data ?? []) as GalleryItem[]
  const [selected, setSelected] = useState<GalleryItem | null>(null)

  if (isLoading) return <div className="px-[5.5%] py-16 text-sm text-[#69736c]">Loading gallery...</div>
  if (error) return <div className="px-[5.5%] py-16 text-sm text-red-700">Unable to load gallery.</div>

  return (
    <div className="px-[5.5%] py-16 max-sm:px-[8%]">
      <Seo title="Gallery" path="/gallery" />
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 06 &nbsp; Campus moments</p>
        <h1 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">Gallery</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <button key={item._id} className="group relative aspect-square overflow-hidden rounded-xl bg-[#e5e9dd]" onClick={() => setSelected(item)}>
            {item.kind === 'image' ? <img src={item.mediaUrl} alt={item.title || ''} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <video src={item.mediaUrl} className="h-full w-full object-cover" />}
            <span className="absolute bottom-2 left-2 rounded bg-ink/70 px-2 py-1 text-[10px] uppercase tracking-wider text-white">{item.kind === 'video' ? 'Video' : 'Photo'}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-[#192a24]/90 p-5" onClick={() => setSelected(null)} role="dialog" aria-modal="true" aria-label="Media preview">
          <button className="absolute right-5 top-5 text-white" aria-label="Close lightbox" onClick={() => setSelected(null)}><X size={24} /></button>
          <div className="max-h-[90vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {selected.kind === 'image' ? <img src={selected.mediaUrl} alt={selected.title || ''} className="max-h-[85vh] w-auto rounded-lg" /> : <video src={selected.mediaUrl} controls autoPlay className="max-h-[85vh] w-auto rounded-lg" />}
            {selected.title && <p className="mt-3 text-center text-sm text-white/80">{selected.title}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
