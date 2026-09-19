import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Seo } from '../components/Seo'
import { reportService } from '../services/reportService'

type Settings = { schoolName?: string; mission?: string; vision?: string; description?: string; address?: string; phone?: string; email?: string }

export default function About() {
  const { data: settingsData } = useQuery({ queryKey: ['public-settings'], queryFn: async () => (await api.get('/v1/settings/public')).data })
  const { data: statsData } = useQuery({ queryKey: ['public-stats'], queryFn: reportService.getPublicStats })
  const settings = (settingsData?.data ?? {}) as Settings

  const staffCount = statsData?.staff ?? 0
  const studentCount = statsData?.students ?? 0
  const passRate = statsData?.passRate != null ? `${statsData.passRate}%` : '--'
  const ratio = staffCount > 0 ? `${Math.round(studentCount / staffCount)}:1` : '--'

  return (
    <div className="bg-paper dark:bg-[#18231f] dark:text-[#edf1e7]">
      <Seo title="About" path="/about" image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1800&q=85" />
      <section className="relative flex min-h-[400px] items-center bg-[#cbd8c8] max-sm:min-h-[300px]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,56,46,.8),rgba(28,56,46,.4)_50%,transparent)]" />
        <div className="relative px-[5.5%] py-16 max-sm:px-[8%]">
          <p className="text-[10px] uppercase tracking-[.15em] text-sun">/ 01 &nbsp; Our story</p>
          <h1 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em] text-white">About<br /><em className="text-sun">Northbridge.</em></h1>
        </div>
      </section>
      <section className="px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr] md:gap-[8%]">
          <div className="text-[10px] uppercase tracking-[.15em] text-black">Our approach</div>
          <div>
            <h2 className="mb-6 font-display text-[clamp(36px,4vw,56px)] leading-[.96] tracking-[-.04em]">Education with<br /><em className="text-black">intention.</em></h2>
            <p className="max-w-[600px] text-xl leading-snug text-black">{settings.description || 'We believe the best education does more than prepare students for the future. It gives them the confidence to shape it.'}</p>
          </div>
        </div>
      </section>
      <section className="bg-[#e5e9dd] dark:bg-[#1e2d27] px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[.15em] text-forest">Mission</p>
            <h3 className="mt-3 font-display text-3xl">Our mission</h3>
            <p className="mt-4 leading-relaxed text-[#69736c]">{settings.mission || 'To nurture curious minds and compassionate hearts in a diverse and inclusive community.'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[.15em] text-forest">Vision</p>
            <h3 className="mt-3 font-display text-3xl">Our vision</h3>
            <p className="mt-4 leading-relaxed text-[#69736c]">{settings.vision || 'A world where every learner is empowered to thrive and lead with purpose.'}</p>
          </div>
        </div>
      </section>
      <section className="px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <p className="mb-6 text-[10px] uppercase tracking-[.15em] text-forest">Core values</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {['Integrity', 'Curiosity', 'Compassion', 'Excellence'].map((value) => (
            <div key={value} className="border-t border-[#d8d9d0] pt-4">
              <h3 className="font-display text-2xl">{value}</h3>
              <p className="mt-2 text-sm text-[#69736c]">We live this value every day in how we teach, lead, and learn together.</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#e5e9dd] dark:bg-[#1e2d27] px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <p className="mb-6 text-[10px] uppercase tracking-[.15em] text-black">Principal's message</p>
        <blockquote className="max-w-3xl font-display text-2xl leading-snug md:text-3xl text-[#374151]">"Every child who walks through our doors is a promise. We take that promise seriously, and we work every day to keep it."</blockquote>
        <p className="mt-4 text-sm text-black">— Dr. Amara Okafor, Principal</p>
      </section>
      <section className="px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <p className="mb-8 text-[10px] uppercase tracking-[.15em] text-forest">Management team</p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {['Dr. Amara Okafor — Principal', 'Mr. James Ndlovu — Vice Principal', 'Ms. Sarah Chen — Head of Primary', 'Mr. David Adeyemi — Head of Secondary'].map((member) => (
            <div key={member} className="border-t border-[#d8d9d0] pt-4">
              <h3 className="font-display text-xl">{member.split(' — ')[0]}</h3>
              <p className="text-sm text-[#69736c]">{member.split(' — ')[1]}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#e5e9dd] px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <p className="mb-8 text-[10px] uppercase tracking-[.15em] text-forest">Facilities</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {['Science & Computer Labs', 'Library & Media Center', 'Arts & Music Studios', 'Sports Complex', 'Swimming Pool', 'Auditorium'].map((facility) => (
            <div key={facility} className="rounded-xl border border-[#d8d9d0] bg-paper p-6">
              <h3 className="font-display text-xl">{facility}</h3>
              <p className="mt-2 text-sm text-[#69736c]">World-class spaces designed to inspire learning and creativity.</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <p className="mb-8 text-[10px] uppercase tracking-[.15em] text-forest">Achievements</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: passRate, label: 'Pass rate' },
            { n: '15+', label: 'Clubs & societies' },
            { n: `${staffCount}+`, label: 'Qualified teachers' },
            { n: ratio, label: 'Teacher-student ratio' },
          ].map((stat) => (
            <div key={stat.label} className="border-t border-[#d8d9d0] pt-4">
              <span className="font-display text-4xl text-forest">{stat.n}</span>
              <p className="mt-1 text-sm text-[#69736c]">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
