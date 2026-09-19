import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Seo } from '../components/Seo'

type Event = { _id: string; title: string; description?: string; type: string; startsAt: string; endsAt?: string; location?: string }

export default function Calendar() {
  const { data, isLoading, error } = useQuery({ queryKey: ['public-events'], queryFn: async () => (await api.get('/v1/content/events')).data })
  const events = (data?.data ?? []) as Event[]

  if (isLoading) return <div className="px-[5.5%] py-16 text-sm text-[#69736c]">Loading events...</div>
  if (error) return <div className="px-[5.5%] py-16 text-sm text-red-700">Unable to load events.</div>

  const typeColor: Record<string, string> = { Academic: 'bg-forest text-white', Examination: 'bg-sun text-ink', Holiday: 'bg-[#e5e9dd] text-ink', Meeting: 'bg-[#cbd8c8] text-ink', Sports: 'bg-ink text-white', Cultural: 'bg-sun text-ink', Admission: 'bg-forest text-white', Other: 'bg-[#e5e9dd] text-ink' }

  return (
    <div className="px-[5.5%] py-16 max-sm:px-[8%]">
      <Seo title="Calendar" path="/calendar" />
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 05 &nbsp; Mark your calendar</p>
        <h1 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">What’s<br /><em className="text-forest">coming up.</em></h1>
      </div>
      <div className="space-y-0">
        {events.map((evt) => (
          <div key={evt._id} className="border-t border-[#d8d9d0] py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-wider ${typeColor[evt.type] || typeColor.Other}`}>{evt.type}</span>
                <h3 className="mt-2 font-display text-2xl">{evt.title}</h3>
                {evt.description && <p className="mt-1 text-sm leading-relaxed text-[#69736c]">{evt.description}</p>}
              </div>
              <div className="text-right text-sm text-[#69736c]">
                <p>{new Date(evt.startsAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <p>{new Date(evt.startsAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} {evt.endsAt ? `– ${new Date(evt.endsAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : ''}</p>
                {evt.location && <p className="mt-1 text-xs">{evt.location}</p>}
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-[#69736c]">Upcoming events will appear here.</p>}
      </div>
    </div>
  )
}
