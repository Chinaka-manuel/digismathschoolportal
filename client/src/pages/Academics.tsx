import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { Seo } from '../components/Seo'

type Program = { name: string; ages: string; description: string }
type Department = { _id: string; name: string; head?: string }
type Subject = { _id: string; name: string; code?: string; departmentId?: string }

export default function Academics() {
  const settings = useQuery({ queryKey: ['public-settings'], queryFn: async () => (await api.get('/v1/settings/public')).data })
  const departments = useQuery({ queryKey: ['public-departments'], queryFn: async () => (await api.get('/v1/departments')).data })
  const subjects = useQuery({ queryKey: ['public-subjects'], queryFn: async () => (await api.get('/v1/subjects')).data })

  const programs = (settings.data?.data?.academicPrograms ?? []) as Program[]
  const depts = (departments.data?.data ?? []) as Department[]
  const subs = (subjects.data?.data ?? []) as Subject[]

  return (
    <div className="px-[5.5%] py-16 max-sm:px-[8%] dark:bg-[#18231f] dark:text-[#edf1e7]">
      <Seo title="Academics" path="/academics" image="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1800&q=85" />
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 02 &nbsp; The Northbridge difference</p>
        <h1 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">Academics</h1>
      </div>
      <section className="mb-16">
        <h2 className="mb-8 font-display text-3xl">Programs</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((prog, idx) => (
            <div key={idx} className="rounded-xl border border-[#d8d9d0] bg-white dark:bg-[#22322c] dark:border-[#3a4b43] p-6 shadow-sm">
              <p className="text-[10px] uppercase tracking-[.15em] text-forest">{prog.ages}</p>
              <h3 className="mt-2 font-display text-2xl">{prog.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#69736c] dark:text-[#a3b0a5]">{prog.description || 'A rich, balanced curriculum designed for holistic development.'}</p>
            </div>
          ))}
          {programs.length === 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {[{ name: 'Early Years', ages: 'Ages 3-5' }, { name: 'Primary School', ages: 'Ages 6-11' }, { name: 'Junior Secondary', ages: 'Ages 12-14' }, { name: 'Senior Secondary', ages: 'Ages 15-18' }].map((p) => (
                <div key={p.name} className="rounded-xl border border-[#d8d9d0] bg-white dark:bg-[#22322c] dark:border-[#3a4b43] p-6 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[.15em] text-forest">{p.ages}</p>
                  <h3 className="mt-2 font-display text-2xl">{p.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#69736c] dark:text-[#a3b0a5]">A rich, balanced curriculum designed for holistic development.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="mb-16">
        <h2 className="mb-8 font-display text-3xl">Departments</h2>
        {departments.isLoading ? <p className="text-sm text-[#69736c] dark:text-[#a3b0a5]">Loading departments...</p> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {depts.map((dept) => (
              <div key={dept._id} className="border-t border-[#d8d9d0] dark:border-[#3a4b43] pt-4">
                <h3 className="font-display text-xl">{dept.name}</h3>
                {dept.head && <p className="mt-1 text-sm text-[#69736c] dark:text-[#a3b0a5]">HOD: {dept.head}</p>}
              </div>
            ))}
            {depts.length === 0 && <p className="text-sm text-[#69736c] dark:text-[#a3b0a5]">No departments listed yet.</p>}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-8 font-display text-3xl">Subjects</h2>
        {subjects.isLoading ? <p className="text-sm text-[#69736c] dark:text-[#a3b0a5]">Loading subjects...</p> : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subs.map((sub) => (
              <div key={sub._id} className="flex items-center justify-between rounded-lg border border-[#d8d9d0] dark:border-[#3a4b43] px-4 py-3">
                <div>
                  <p className="font-medium">{sub.name}</p>
                  {sub.code && <p className="text-xs text-[#69736c] dark:text-[#a3b0a5]">{sub.code}</p>}
                </div>
              </div>
            ))}
            {subs.length === 0 && <p className="text-sm text-[#69736c] dark:text-[#a3b0a5]">No subjects listed yet.</p>}
          </div>
        )}
      </section>
    </div>
  )
}
