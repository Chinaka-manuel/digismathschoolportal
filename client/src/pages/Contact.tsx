import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { api } from '../api/client'
import { Seo } from '../components/Seo'

type Values = { name: string; email: string; phone?: string; subject?: string; message: string }

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>()
  const submit = async (values: Values) => { setError(''); try { await api.post('/v1/contact', values); setSent(true) } catch (requestError: unknown) { setError(requestError instanceof Error ? requestError.message : 'Unable to send your message right now.') } }

  return (
    <div className="px-[5.5%] py-16 max-sm:px-[8%]">
      <Seo title="Contact" path="/contact" />
      <div className="mb-12">
        <p className="text-[10px] uppercase tracking-[.15em] text-forest">/ 08 &nbsp; Get in touch</p>
        <h1 className="mt-3 font-display text-[clamp(48px,6vw,78px)] leading-[.96] tracking-[-.04em]">Contact<br /><em className="text-forest">us.</em></h1>
      </div>
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <p className="mb-6 text-lg leading-relaxed text-[#69736c]">We’d love to hear from you. Whether you have a question about admissions, academics, or anything else, our team is ready to answer all your questions.</p>
          <div className="space-y-4 text-sm">
            <div><p className="text-[10px] uppercase tracking-[.15em] text-forest">Address</p><p className="mt-1 text-[#69736c]">14 Orchard Lane</p></div>
            <div><p className="text-[10px] uppercase tracking-[.15em] text-forest">Phone</p><p className="mt-1 text-[#69736c]">+234 800 555 0198</p></div>
            <div><p className="text-[10px] uppercase tracking-[.15em] text-forest">Email</p><p className="mt-1 text-[#69736c]">hello@northbridge.edu</p></div>
          </div>
        </div>
        <div>
          {sent ? (
            <div className="py-8 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e5e9dd] text-forest"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg></div>
              <h3 className="mt-5 font-display text-3xl">Message received.</h3>
              <p className="mt-2 text-sm text-[#69736c]">Our school office will be in touch shortly.</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(submit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">Name<input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" {...register('name', { required: 'Name is required' })} />{errors.name && <span className="text-xs text-red-700">{errors.name.message}</span>}</label>
                <label className="block text-sm">Email<input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" type="email" {...register('email', { required: 'Email is required' })} />{errors.email && <span className="text-xs text-red-700">{errors.email.message}</span>}</label>
              </div>
              <label className="block text-sm">Subject<input className="mt-2 w-full border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" {...register('subject')} /></label>
              <label className="block text-sm">Message<textarea className="mt-2 min-h-28 w-full resize-y border border-[#d8d9d0] bg-transparent px-3 py-3 outline-none focus:border-forest" {...register('message', { required: 'Message is required' })} />{errors.message && <span className="text-xs text-red-700">{errors.message.message}</span>}</label>
              {error && <p className="text-sm text-red-700">{error}</p>}
              <button className="flex w-full items-center justify-between bg-forest px-4 py-4 text-xs uppercase tracking-[.08em] text-white disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? 'Sending...' : 'Send message'} <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
