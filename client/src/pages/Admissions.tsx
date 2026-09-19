import { useState } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Seo } from '../components/Seo'

type Faq = { question: string; answer: string }

export default function Admissions() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const faqs: Faq[] = [
    { question: 'When does the academic year start?', answer: 'Our academic year typically begins in September. Orientation week is held the week prior.' },
    { question: 'What is the application deadline?', answer: 'Applications for the upcoming academic year close on July 31st, but we recommend applying early.' },
    { question: 'Are scholarships available?', answer: 'Yes, we offer merit-based and need-based scholarships. Contact our admissions office for details.' },
    { question: 'What documents are required?', answer: 'You will need previous academic records, a birth certificate, passport photographs, and a completed application form.' },
  ]

  return (
    <div className="bg-paper">
      <Seo title="Admissions" path="/admissions" image="https://images.unsplash.com/photo-1523240794352-6c4734037078?auto=format&fit=crop&w=1800&q=85" />
      <section className="relative flex min-h-[400px] items-center bg-[#cbd8c8] max-sm:min-h-[300px]">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,56,46,.8),rgba(28,56,46,.4)_50%,transparent)]" />
        <div className="relative px-[5.5%] py-16 max-sm:px-[8%]">
          <p className="text-[10px] uppercase tracking-[.15em] text-sun">/ 03 &nbsp; Begin your journey</p>
          <h1 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em] text-white">Admissions</h1>
          <p className="mt-4 max-w-lg text-white/80">Come and see what learning can feel like when it is personal, purposeful, and full of possibility.</p>
          <Link to="/admissions/apply" className="mt-8 inline-flex items-center gap-6 bg-sun px-5 py-4 text-xs uppercase tracking-[.08em] text-ink">Start an application <ArrowRight size={17} /></Link>
        </div>
      </section>
      <section className="px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <h2 className="mb-8 font-display text-[clamp(36px,4vw,56px)] leading-[.96] tracking-[-.04em]">Requirements</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {['Completed application form', 'Previous academic records', 'Birth certificate', 'Passport photographs', 'Immunization records', 'Parent/guardian ID'].map((req) => (
            <div key={req} className="flex items-start gap-3 border-t border-[#d8d9d0] pt-4">
              <span className="mt-1 h-2 w-2 rounded-full bg-forest" />
              <span>{req}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#e5e9dd] px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <h2 className="mb-8 font-display text-[clamp(36px,4vw,56px)] leading-[.96] tracking-[-.04em]">How to apply</h2>
        <div className="grid gap-6 md:grid-cols-4">
          {['Submit application', 'Assessment & interview', 'Offer letter', 'Enrollment'].map((step, idx) => (
            <div key={step} className="rounded-xl border border-[#d8d9d0] bg-paper p-6">
              <span className="text-3xl font-display text-forest">0{idx + 1}</span>
              <h3 className="mt-2 font-display text-xl">{step}</h3>
              <p className="mt-1 text-sm text-[#69736c]">Our admissions team will guide you through each step.</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <h2 className="mb-8 font-display text-[clamp(36px,4vw,56px)] leading-[.96] tracking-[-.04em]">Available classes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {['Early Years 1-2', 'Primary 1-6', 'JSS 1-3', 'SS 1-3'].map((cls) => (
            <div key={cls} className="border-t border-[#d8d9d0] pt-4">
              <h3 className="font-display text-xl">{cls}</h3>
              <p className="mt-1 text-sm text-[#69736c]">Limited spaces available for 2026-27.</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-[#e5e9dd] dark:bg-[#1e2d27] px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <h2 className="mb-8 font-display text-[clamp(36px,4vw,56px)] leading-[.96] tracking-[-.04em]">Important dates</h2>
        <div className="space-y-0">
          {['Application opens: January 15', 'Application deadline: July 31', 'Assessment week: August 10-14', 'Results & offers: August 21', 'Enrollment closes: September 1'].map((date) => (
            <div key={date} className="border-t border-[#d8d9d0] dark:border-[#3a4b43] py-4">
              <p className="font-medium text-[#69736c] dark:text-[#c8d4cd]">{date}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="px-[5.5%] py-[105px] max-sm:px-[8%] max-sm:py-16">
        <h2 className="mb-8 font-display text-[clamp(36px,4vw,56px)] leading-[.96] tracking-[-.04em]">FAQs</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-t border-[#d8d9d0]">
              <button className="flex w-full items-center justify-between py-4 text-left" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                <span className="font-display text-xl">{faq.question}</span>
                <ChevronDown size={20} className={`transition ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && <p className="pb-4 text-sm leading-relaxed text-[#69736c]">{faq.answer}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
