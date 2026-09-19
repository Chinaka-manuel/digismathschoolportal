import { Helmet } from 'react-helmet-async'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'

type Settings = {
  schoolName?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  socialLinks?: { facebook?: string; instagram?: string; tiktok?: string; twitter?: string; youtube?: string; linkedin?: string }
}

type SeoProps = {
  title?: string
  description?: string
  path?: string
  image?: string
}

export function Seo({ title = 'Northbridge International School', description, path = '', image }: SeoProps) {
  const { data } = useQuery({ queryKey: ['public-settings'], queryFn: async () => (await api.get('/v1/settings/public')).data })
  const settings = (data?.data ?? {}) as Settings
  const siteName = settings.schoolName || 'Northbridge International School'
  const metaDescription = description || settings.description || 'A place to grow curious minds, courageous hearts, and a lifelong love of learning.'
  const url = `${window.location.origin}${path}`
  const social = settings.socialLinks || {}

  return (
    <Helmet>
      <title>{title} | {siteName}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${title} | ${siteName}`} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | ${siteName}`} />
      <meta name="twitter:description" content={metaDescription} />
      {image && <meta name="twitter:image" content={image} />}
      {social.facebook && <meta property="og:see_also" content={social.facebook} />}
      {social.twitter && <meta name="twitter:site" content={social.twitter} />}
    </Helmet>
  )
}
