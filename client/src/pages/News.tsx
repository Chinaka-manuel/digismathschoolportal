import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import { Seo } from '../components/Seo'

type NewsItem = { title: string; slug: string; excerpt?: string; featuredImage?: string; publishedAt: string }

export default function News() {
  const { data, isLoading, error } = useQuery({ queryKey: ['public-news'], queryFn: async () => (await api.get('/v1/content/news')).data })

  return (
    <div className="px-[5.5%] py-16 max-sm:px-[8%]">
      <Seo title="News" path="/news" />
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 04 &nbsp; From campus</p>
        <h1 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">The latest<br /><em className="text-forest">at Northbridge.</em></h1>
      </div>
      {isLoading ? <p className="text-sm text-[#69736c]">Loading stories...</p> : error ? <p className="text-sm text-red-700">Unable to load news right now.</p> : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {(data?.data ?? []).map((item: NewsItem) => (
            <article key={item.slug} className="border-t border-[#d8d9d0] pt-5">
              {item.featuredImage && <img src={item.featuredImage} alt="" className="mb-4 h-48 w-full rounded-lg object-cover" />}
              <p className="text-xs uppercase tracking-wider text-forest">{new Date(item.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <h2 className="mt-2 font-display text-2xl">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#69736c]">{item.excerpt || 'Read the latest from our school community.'}</p>
              <Link className="mt-4 inline-flex items-center gap-2 border-b border-forest pb-1 text-sm text-forest" to={`/news/${item.slug}`}>Read more <ArrowRight size={15} /></Link>
            </article>
          ))}
          {!data?.data?.length && <p className="text-sm text-[#69736c]">New stories are on the way.</p>}
        </div>
      )}
    </div>
  )
}
