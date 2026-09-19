const knowledge = [
  { terms: ['admission', 'apply', 'application'], answer: 'Admissions for 2026-27 are open. Use the online application form on this website to receive an application number.' },
  { terms: ['academic', 'program', 'class', 'nursery', 'primary', 'secondary'], answer: 'Northbridge offers Early Years, Primary, Junior Secondary, and Senior Secondary pathways with learner-first support.' },
  { terms: ['contact', 'phone', 'email', 'address'], answer: 'You can reach Northbridge at hello@northbridge.edu or +234 800 555 0198. Our campus is at 14 Orchard Lane, Abuja.' },
  { terms: ['fee', 'fees', 'payment'], answer: 'Fee details are confirmed during the admissions process. Payments are verified securely through the school payment service.' },
]

export function answerQuestion(message) {
  const normalized = message.toLowerCase()
  const match = knowledge.find((item) => item.terms.some((term) => normalized.includes(term)))
  return match?.answer || 'I can help with admissions, academics, fees, contact details, and school information. What would you like to know?'
}
