import { ArrowRight, Quote, Users, Globe2, ShieldCheck, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import AdmissionForm from './AdmissionForm'
import { Chatbot } from '../components/Chatbot'
import { ContactForm } from '../components/ContactForm'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'
import { reportService } from '../services/reportService'
import { api } from '../api/client'

type Slide = { id: string; title: string; subtitle: string; image: string; cta?: string; to?: string }
type Testimonial = { id: string; name: string; role: string; quote: string }
type Stat = { icon: LucideIcon; value: string; label: string }
type Feature = { icon: LucideIcon; title: string; body: string }

const FEATURES: Feature[] = [
  { icon: Users, title: 'Qualified Teachers', body: 'Passionate educators who inspire lifelong learning.' },
  { icon: Globe2, title: 'Modern Learning', body: 'Science labs, libraries, and creative studios.' },
  { icon: ShieldCheck, title: 'Safe Environment', body: 'Caring supervision and a culture of respect.' },
  { icon: ShieldCheck, title: 'Tech-Driven', body: 'Smart classrooms and digital literacy from early years.' },
  { icon: Sparkles, title: 'Holistic Growth', body: 'Sports, arts, clubs, and character development.' },
  { icon: ShieldCheck, title: 'Excellent Results', body: 'Consistently outstanding exam performance.' },
]

const HERO_SLIDES: Slide[] = [
  { id: '1', title: 'Find your brilliant.', subtitle: 'Learning for a changing world', image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1800&q=85', cta: 'Explore admissions', to: '/admissions' },
  { id: '2', title: 'Curiosity in action.', subtitle: 'Hands-on learning in science, arts, and sport', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1800&q=85', cta: 'Discover academics', to: '/academics' },
  { id: '3', title: 'A community that cares.', subtitle: 'Every child is known, challenged, and supported', image: 'https://images.unsplash.com/photo-1523240794352-6c4734037078?auto=format&fit=crop&w=1800&q=85', cta: 'Our story', to: '/about' },
]

const TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Mrs. Adeyemi', role: 'Parent, JSS 2', quote: 'The teachers truly know each child. Our daughter has grown more confident and curious than we ever imagined.' },
  { id: '2', name: 'Mr. Ndlovu', role: 'Parent, Primary 4', quote: 'Northbridge balances academic rigor with character development. The environment is warm and rigorous at the same time.' },
  { id: '3', name: 'Dr. Okafor', role: 'Principal', quote: 'We do not just prepare students for exams. We prepare them for life.' },
]

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('visible')
          observer.unobserve(element)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return ref
}

export default function Home() {
  const [applicationOpen, setApplicationOpen] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const { data: statsData } = useQuery({ queryKey: ['public-stats'], queryFn: reportService.getPublicStats })
  const { data: newsData } = useQuery({ queryKey: ['public-news'], queryFn: () => api.get('/v1/content/news?limit=3').then((res) => res.data.data) })
  const { data: eventsData } = useQuery({ queryKey: ['public-events'], queryFn: () => api.get('/v1/content/events?limit=3').then((res) => res.data.data) })
  const { data: galleryData } = useQuery({ queryKey: ['public-gallery'], queryFn: () => api.get('/v1/gallery?limit=8').then((res) => res.data.data) })

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000)
    return () => clearInterval(timer)
  }, [nextSlide])

  const slide = HERO_SLIDES[currentSlide]
  const stories = ((galleryData ?? []) as Array<{ _id: string; title: string; mediaUrl: string; category: string }>).slice(0, 8)

  const stats: Stat[] = [
    { icon: Users, value: `${statsData?.students ?? '--'}`, label: 'Students' },
    { icon: Users, value: `${statsData?.staff ?? '--'}`, label: 'Teachers' },
    { icon: ShieldCheck, value: statsData?.passRate != null ? `${statsData.passRate}%` : '--', label: 'Pass rate' },
    { icon: Sparkles, value: '40+', label: 'Years of excellence' },
  ]

  const aboutRef = useReveal()
  const statsRef = useReveal()
  const programsRef = useReveal()
  const galleryRef = useReveal()
  const whyRef = useReveal()
  const testimonialsRef = useReveal()
  const newsRef = useReveal()
  const admissionsRef = useReveal()

  return (
    <>
      <Seo title="Home" path="/" image="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1800&q=85" />

      {/* Hero Slideshow */}
      <section className="relative flex min-h-[650px] items-center overflow-hidden" id="top">
        {HERO_SLIDES.map((item, idx) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            aria-hidden={idx !== currentSlide}
            style={{ background: `linear-gradient(90deg, rgba(28,56,46,.87), rgba(28,56,46,.5) 45%, rgba(28,56,46,.05)), url('${item.image}')` }}
          />
        ))}
        <div className="relative ml-[11%] max-w-[500px] py-20 text-white max-sm:mx-[8%]">
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[.16em]"><span className="h-px w-6 bg-current" /> {slide.subtitle}</p>
          <h1 className="my-7 font-display text-[clamp(70px,9vw,124px)] leading-[.87] tracking-[-.06em]">{slide.title}</h1>
          <p className="max-w-[350px] text-base leading-relaxed text-white/80">A place to grow curious minds, courageous hearts, and a lifelong love of learning.</p>
          {slide.cta && slide.to && (
            <Link to={slide.to} className="mt-8 inline-flex items-center gap-6 bg-white px-5 py-4 text-xs uppercase tracking-[.08em] text-ink">
              {slide.cta} <ArrowRight size={17} />
            </Link>
          )}
        </div>
        <div className="absolute bottom-9 right-[5.5%] flex items-end gap-6 text-white">
          <div className="flex gap-2">
            {HERO_SLIDES.map((_, idx) => (
              <button key={idx} className={`h-1 w-8 transition ${idx === currentSlide ? 'bg-sun' : 'bg-white/40'}`} onClick={() => setCurrentSlide(idx)} aria-label={`Go to slide ${idx + 1}`} />
            ))}
          </div>
          <div className="w-40 text-[11px]">
            <span>Est. 1987</span>
            <strong className="mt-2 block text-xl">0{currentSlide + 1} <small className="font-normal opacity-60">/ 0{HERO_SLIDES.length}</small></strong>
            <div className="mt-2 h-px bg-white/50"><div className="h-0.5 bg-sun" style={{ width: `${((currentSlide + 1) / HERO_SLIDES.length) * 100}%` }} /></div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section ref={aboutRef} className="reveal grid gap-12 px-[11%] py-[105px] md:grid-cols-[1fr_2fr] md:gap-[8%]" id="about">
        <div className="text-[10px] uppercase tracking-[.15em] text-forest">/ 01 &nbsp; Our approach</div>
        <div>
          <h2 className="mb-6 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">Education with<br /><em className="text-forest">intention.</em></h2>
          <p className="max-w-[480px] text-xl leading-snug text-[#69736c]">We believe the best education does more than prepare students for the future. It gives them the confidence to shape it.</p>
          <Link to="/about" className="mt-8 flex w-max items-center gap-2 border-b border-forest pb-2 text-sm text-forest">Discover our philosophy <ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* Stats */}
      <section ref={statsRef} className="reveal bg-[#e5e9dd] px-[11%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="border-t border-black pt-4 text-black">
              <item.icon size={20} className="text-black" />
              <strong className="mt-4 block font-display text-4xl text-black">{item.value}</strong>
              <p className="mt-1 text-sm text-black">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programs / Blurred Background Section */}
      <section ref={programsRef} className="reveal relative overflow-hidden px-[11%] py-[105px] max-sm:px-[8%] max-sm:py-16" id="academics">
        <div className="absolute inset-0 bg-cover bg-center saturate-75 backdrop-blur-3xl" style={{ backgroundImage: `linear-gradient(135deg, rgba(28,56,46,.92), rgba(34,50,44,.88) 50%, rgba(28,56,46,.92)), url('https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1800&q=85')` }} />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[.15em] text-sun">/ 02 &nbsp; The Northbridge difference</p>
          <h2 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em] text-white">Programs built<br />for <em className="text-sun">tomorrow.</em></h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Early Years', 'Ages 3-5', 'Play-based discovery and social growth.'],
              ['Primary School', 'Ages 6-11', 'Strong foundations in literacy, numeracy, and science.'],
              ['Junior Secondary', 'Ages 12-14', 'Exploratory subjects and independent thinking.'],
              ['Senior Secondary', 'Ages 15-18', 'Exam preparation, leadership, and career readiness.'],
            ].map(([title, age, desc]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur">
                <p className="text-[10px] uppercase tracking-[.15em] text-sun">{age}</p>
                <h3 className="mt-2 font-display text-2xl">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Picture Stories / Campus Gallery */}
      <section ref={galleryRef} className="reveal px-[11%] py-[105px] max-sm:px-[8%] max-sm:py-16" id="campus-life">
        <div className="mb-12 flex items-end justify-between max-sm:flex-col max-sm:items-start max-sm:gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[.15em] text-forest">/ 03 &nbsp; Picture stories</div>
            <h2 className="mt-2 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">Life at <em className="text-forest">Northbridge.</em></h2>
          </div>
          <Link to="/gallery" className="flex items-center gap-2 border-b border-forest pb-2 text-sm text-forest">View full gallery <ArrowRight size={16} /></Link>
        </div>
        {stories.length === 0 ? (
          <p className="text-sm text-[#69736c]">No gallery items yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {stories.map((story) => (
              <div key={story._id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#e5e9dd]">
                <img src={story.mediaUrl} alt={story.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#192a24]/80 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-sun">{story.category}</p>
                  <p className="font-display text-lg text-white">{story.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us - Blurred Background */}
      <section ref={whyRef} className="reveal relative overflow-hidden px-[11%] py-[105px] max-sm:px-[8%] max-sm:py-16" id="why-us">
        <div className="absolute inset-0 bg-cover bg-center saturate-75 backdrop-blur-3xl" style={{ backgroundImage: `linear-gradient(180deg, rgba(245,243,237,.92), rgba(245,243,237,.96) 50%, rgba(245,243,237,.92)), url('https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1800&q=85')` }} />
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 04 &nbsp; Why Northbridge</p>
          <h2 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">The difference is<br /><em className="text-forest">in the details.</em></h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((item) => (
              <div key={item.title} className="rounded-xl border border-[#d8d9d0] bg-white/60 p-6 backdrop-blur">
                <item.icon size={20} className="text-forest" />
                <h3 className="mt-4 font-display text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#69736c]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testimonialsRef} className="reveal bg-[#e5e9dd] px-[11%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 05 &nbsp; Testimonials</p>
        <h2 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">Voices from our<br /><em className="text-forest">community.</em></h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <div key={item.id} className="border-t border-[#b9c5b9] pt-6">
              <Quote size={24} className="text-forest" />
              <p className="mt-4 font-display text-xl leading-snug">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-6">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-[#69736c]">{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* News & Events */}
      <section ref={newsRef} className="reveal grid gap-10 bg-[#e5e9dd] px-[11%] py-[90px] md:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 06 &nbsp; From campus</p>
          <h2 className="mt-3 font-display text-5xl tracking-[-.04em]">The latest<br /><em className="text-forest">at Northbridge.</em></h2>
          <div className="mt-8 space-y-4">
            {(newsData ?? []).length === 0 ? (
              <p className="text-sm text-[#69736c]">No news yet.</p>
            ) : (
              (newsData ?? []).slice(0, 3).map((item: any) => (
                <Link key={item._id} to={`/news/${item.slug}`} className="block border-t border-[#b9c5b9] pt-4">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-[#69736c]">{item.excerpt}</p>
                </Link>
              ))
            )}
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 07 &nbsp; Mark your calendar</p>
          <h2 className="mt-3 font-display text-5xl tracking-[-.04em]">What&apos;s<br /><em className="text-forest">coming up.</em></h2>
          <div className="mt-8 space-y-4">
            {(eventsData ?? []).length === 0 ? (
              <p className="text-sm text-[#69736c]">No upcoming events.</p>
            ) : (
              (eventsData ?? []).slice(0, 3).map((item: any) => (
                <div key={item._id} className="border-t border-[#b9c5b9] pt-4">
                  <div className="flex justify-between gap-4">
                    <p className="text-sm font-medium">{item.title}</p>
                    <span className="text-[10px] uppercase tracking-wider text-forest">{item.type || 'Event'}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#69736c]">{new Date(item.startsAt).toLocaleDateString()} · {item.location || 'Northbridge campus'}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Admissions CTA */}
      <section ref={admissionsRef} className="reveal grid gap-10 bg-forest px-[11%] py-[92px] text-white md:grid-cols-2 md:gap-[8%]" id="admissions">
        <div>
          <p className="flex items-center gap-2 text-[11px] uppercase tracking-[.16em]"><span className="h-px w-6 bg-sun" /> Begin your journey</p>
          <h2 className="mt-6 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">There&apos;s a seat<br />waiting <em className="text-sun">for you.</em></h2>
        </div>
        <div>
          <p className="mt-16 max-w-[300px] leading-relaxed text-white/70 max-md:mt-0">Come and see what learning can feel like when it is personal, purposeful, and full of possibility.</p>
          <button className="mt-7 inline-flex items-center gap-6 bg-sun px-5 py-4 text-xs uppercase tracking-[.08em] text-ink" onClick={() => setApplicationOpen(true)}>Start an application <ArrowRight size={17} /></button>
        </div>
      </section>

      {applicationOpen && <AdmissionForm onClose={() => setApplicationOpen(false)} />}
      <Chatbot />
      {contactOpen && <ContactForm onClose={() => setContactOpen(false)} />}
    </>
  )
}
