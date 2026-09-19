import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../api/client'

type NewsDetail = { title: string; slug: string; content: string; featuredImage?: string; publishedAt: string; excerpt?: string }

export default function NewsDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, error } = useQuery({ queryKey: ['public-news', slug], queryFn: async () => (await api.get('/v1/content/news', { params: { search: slug } })).data, enabled: Boolean(slug) })

  const articles = data?.data as NewsDetail[] | undefined
  const article = articles?.[0]

  if (isLoading) return <div className="px-[5.5%] py-16 text-sm text-[#69736c]">Loading article...</div>
  if (error || !article) return <div className="px-[5.5%] py-16 text-sm text-red-700">Article not found.</div>

  return (
    <div className="px-[5.5%] py-16 max-sm:px-[8%]">
      <Link className="mb-8 inline-flex items-center gap-2 text-sm text-forest" to="/news"><ArrowLeft size={16} /> Back to news</Link>
      {article.featuredImage && <img src={article.featuredImage} alt="" className="mb-8 h-64 w-full rounded-xl object-cover md:h-96" />}
      <p className="text-xs uppercase tracking-wider text-forest">{new Date(article.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <h1 className="mt-3 font-display text-[clamp(36px,5vw,64px)] leading-[.96] tracking-[-.04em]">{article.title}</h1>
      {article.excerpt && <p className="mt-4 text-lg leading-relaxed text-[#69736c]">{article.excerpt}</p>}
      <div className="prose prose-lg mt-8 max-w-none leading-relaxed text-ink" dangerouslySetInnerHTML={{ __html: article.content }} />
    </div>
  )
}
