import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '../api/client'

type AdmissionValues = { applicantName: string; email: string; requestedClass: string; dateOfBirth: string; guardianName: string; guardianPhone: string; previousSchool: string; lastClass: string; emergencyContact: string; medicalNotes: string; documentName: string }
const steps = ['Applicant', 'Guardian', 'Previous school', 'Academic', 'Medical', 'Documents', 'Review', 'Payment', 'Submit']

export default function AdmissionForm({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState(0)
  const [result, setResult] = useState<{ applicationNumber: string; status: string } | null>(null)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, trigger, getValues, formState: { errors, isSubmitting } } = useForm<AdmissionValues>()
  const fieldsByStep: Record<number, (keyof AdmissionValues)[]> = { 0: ['applicantName', 'email', 'requestedClass'], 1: ['guardianName', 'guardianPhone'], 2: ['previousSchool'], 3: ['lastClass'], 4: ['emergencyContact'], 5: ['documentName'], 6: [], 7: [], 8: [] }
  const next = async () => { const fields = fieldsByStep[step]; if (fields.length === 0 || await trigger(fields)) setStep(Math.min(step + 1, steps.length - 1)) }
  const submit = async (values: AdmissionValues) => { setServerError(''); try { const response = await api.post('/v1/admissions', values); setResult(response.data.data) } catch (error: any) { setServerError(error.response?.data?.message || 'Unable to submit application. Please try again.') } }
  const input = (name: keyof AdmissionValues, label: string, type = 'text', required = true) => <label className="block text-sm text-ink dark:text-[#edf1e7]">{label}<input className="mt-2 w-full border border-[#d8d9d0] dark:border-[#3a4b43] dark:bg-[#22322c] dark:text-[#edf1e7] px-3 py-3 outline-none focus:border-forest" type={type} {...register(name, { required: required ? `${label} is required` : false })} />{errors[name] && <span className="mt-1 block text-xs text-red-700">{errors[name]?.message}</span>}</label>

  const formContent = (
    <div className={!onClose ? 'min-h-screen bg-paper dark:bg-[#18231f] dark:text-[#edf1e7]' : ''}>
      <div className="mx-auto max-w-3xl bg-paper dark:bg-[#18231f] dark:text-[#edf1e7] shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#d8d9d0] dark:border-[#3a4b43] p-6 sm:p-8">
          <div>
            <p className="text-[10px] uppercase tracking-[.15em] text-forest">Admissions 2026-27</p>
            <h2 className="mt-2 font-display text-4xl">Your next chapter.</h2>
          </div>
          {onClose && <button className="p-2" aria-label="Close application" onClick={onClose}><X size={20} /></button>}
        </header>
        {result ? (
          <div className="p-8 text-center sm:p-16">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e5e9dd] dark:bg-[#1e2d27] text-forest"><Check /></div>
            <p className="mt-6 text-[10px] uppercase tracking-[.15em] text-forest">Application received</p>
            <h3 className="mt-2 font-display text-4xl">You're on your way.</h3>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#69736c] dark:text-[#a3b0a5]">Keep this application number safe. Our admissions team will review your details and contact you soon.</p>
            <div className="mx-auto mt-8 max-w-xs border border-[#d8d9d0] dark:border-[#3a4b43] p-4">
              <span className="block text-[10px] uppercase tracking-[.15em] text-[#69736c] dark:text-[#a3b0a5]">Application number</span>
              <strong className="mt-1 block font-display text-2xl text-forest">{result.applicationNumber}</strong>
              <span className="mt-2 block text-xs text-[#69736c] dark:text-[#a3b0a5]">Status: {result.status}</span>
            </div>
            {onClose && <button className="mt-8 border-b border-forest pb-2 text-sm text-forest" onClick={onClose}>Return to Northbridge <ArrowRight className="inline" size={15} /></button>}
          </div>
        ) : (
          <form onSubmit={handleSubmit(submit)}>
            <div className="flex gap-1 overflow-x-auto border-b border-[#d8d9d0] dark:border-[#3a4b43] px-6 py-4 sm:px-8">
              {steps.map((label, index) => (
                <button key={label} className={index === step ? 'whitespace-nowrap border-b-2 border-forest px-2 py-2 text-[10px] uppercase tracking-wider text-forest' : 'whitespace-nowrap px-2 py-2 text-[10px] uppercase tracking-wider text-[#69736c] dark:text-[#a3b0a5]'} type="button" onClick={() => index <= step && setStep(index)}>{index + 1}. {label}</button>
              ))}
            </div>
            <div className="min-h-[290px] p-6 sm:p-8">
              {step === 0 && <div className="grid gap-5 sm:grid-cols-2">{input('applicantName', 'Applicant full name')} {input('email', 'Email address', 'email')}<div className="sm:col-span-2">{input('requestedClass', 'Applying for')}</div></div>}
              {step === 1 && <div className="grid gap-5 sm:grid-cols-2">{input('guardianName', 'Parent or guardian name')}{input('guardianPhone', 'Guardian phone', 'tel')}</div>}
              {step === 2 && <div className="max-w-md">{input('previousSchool', 'Previous school')}</div>}
              {step === 3 && <div className="max-w-md">{input('lastClass', 'Last class completed')}</div>}
              {step === 4 && <div className="grid gap-5 sm:grid-cols-2">{input('emergencyContact', 'Emergency contact')}{input('medicalNotes', 'Medical notes', 'text', false)}</div>}
              {step === 5 && <div className="max-w-md">{input('documentName', 'Document name (e.g. birth certificate or report card)')}</div>}
              {step === 6 && <div className="space-y-3 text-sm text-[#69736c] dark:text-[#a3b0a5]"><p>Review your core application details before continuing.</p><p><strong className="text-ink dark:text-[#edf1e7]">Applicant:</strong> {getValues('applicantName') || 'Not provided'}</p><p><strong className="text-ink dark:text-[#edf1e7]">Class:</strong> {getValues('requestedClass') || 'Not provided'}</p><p><strong className="text-ink dark:text-[#edf1e7]">Guardian:</strong> {getValues('guardianName') || 'Not provided'}</p></div>}
              {step === 7 && <div className="max-w-md"><p className="text-sm leading-relaxed text-[#69736c] dark:text-[#a3b0a5]">The application fee can be completed securely after your application is reviewed. No payment is taken in this step.</p><div className="mt-6 border border-[#d8d9d0] dark:border-[#3a4b43] p-4 text-sm"><span className="text-[#69736c] dark:text-[#a3b0a5]">Application processing</span><strong className="float-right text-forest">Pending review</strong></div></div>}
              {step === 8 && <div className="text-sm leading-relaxed text-[#69736c] dark:text-[#a3b0a5]">Everything is ready. Submit your application to receive a tracking number.</div>}
              {serverError && <p className="mt-5 text-sm text-red-700">{serverError}</p>}
            </div>
            <footer className="flex justify-between border-t border-[#d8d9d0] dark:border-[#3a4b43] p-6 sm:p-8">
              <button className="flex items-center gap-2 text-sm text-[#69736c] dark:text-[#a3b0a5] disabled:opacity-30" type="button" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={15} /> Back</button>
              {step < steps.length - 1 ? <button className="flex items-center gap-4 bg-forest px-5 py-3 text-xs uppercase tracking-[.08em] text-white" type="button" onClick={next}>Continue <ArrowRight size={16} /></button> : <button className="flex items-center gap-4 bg-sun px-5 py-3 text-xs uppercase tracking-[.08em] text-ink" disabled={isSubmitting} type="submit">{isSubmitting ? 'Submitting...' : 'Submit application'} <ArrowRight size={16} /></button>}
            </footer>
          </form>
        )}
      </div>
    </div>
  )

  if (!onClose) return formContent

  return <div className="fixed inset-0 z-30 overflow-y-auto bg-[#192a24]/75 p-4 sm:p-8">{formContent}</div>
}
