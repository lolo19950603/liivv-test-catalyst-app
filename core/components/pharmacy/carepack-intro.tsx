import Link from 'next/link';

const benefits = [
  {
    title: 'Pharmacist-approved pouches',
    body: 'Every pouch is checked before it ships, and a summary of your medications comes with each delivery.',
  },
  {
    title: 'Sorted by time of day',
    body: 'Morning, noon, evening, and bedtime pouches, labeled with the medication name, dose, date, and time.',
  },
  {
    title: 'Easy to carry',
    body: 'Pouches are simple to open, so you can take the doses you need with you.',
  },
  {
    title: 'Prescriptions and everyday extras',
    body: 'Over-the-counter medications, vitamins, and supplements can be packaged with your prescriptions.',
  },
  {
    title: 'Reminders for what cannot be pouched',
    body: 'Inhalers, injections, and similar medications get a reminder pouch, plus a 7-day notice before something runs out.',
  },
  {
    title: 'A month at your door',
    body: 'A 28-day supply ships every 4 weeks with tracking. There is no limit on how many medications can be included.',
  },
] as const;

const steps = [
  {
    title: 'Tell us what you take',
    body: 'Choose the tablets for your pouches, and note vitamins, as-needed medications, or doses that change often.',
  },
  {
    title: 'A pharmacist sets up the first pack',
    body: 'Your first shipment is reviewed before it leaves. With your permission, we can coordinate with your doctor.',
  },
  {
    title: 'A new pack arrives every 4 weeks',
    body: 'Hold a shipment, ask for a larger supply before you travel, or tell us about a change before the next one ships.',
  },
] as const;

const faqs = [
  {
    question: 'How many medications can go in a CarePack?',
    answer: 'There is no limit. As many prescription medications as you take can be packaged.',
  },
  {
    question: 'What if a dose keeps changing?',
    answer:
      'Medications that stay steady go in the pouches. If a dose changes often, that medication can be sent in a vial instead.',
  },
  {
    question: 'What about insulin, inhalers, or liquids?',
    answer:
      'Insulins, inhalers, syrups, nasal sprays, and other medications that cannot be pouched can ship alongside your CarePack.',
  },
  {
    question: 'Will you work with my doctor?',
    answer:
      'Yes. With your authorization, we can let your doctor know you are using CarePack and request prescriptions directly.',
  },
  {
    question: 'Can vitamins be included?',
    answer:
      'Yes. Over-the-counter medications and vitamins your prescriber recommends can be packaged with your prescriptions.',
  },
  {
    question: 'How often does a CarePack arrive?',
    answer: 'You receive a new package every 4 weeks — a 28-day supply.',
  },
  {
    question: 'How is it delivered?',
    answer:
      'CarePack is shipped to your home with tracking, including Canada Post, Purolator, or UPS.',
  },
  {
    question: 'What does CarePack cost?',
    answer:
      'There is no extra charge for the packaging. You pay the copays or deductibles your insurance assigns for each 4-week supply. The cost of the medication stays the same.',
  },
  {
    question: 'How do I hold or cancel a shipment?',
    answer:
      'Tell us before the next shipment leaves if you want to cancel it, hold it while you are away, or request a larger supply for travel.',
  },
  {
    question: 'What if a medication changes after my CarePack arrives?',
    answer: 'A pharmacist will help you sort out how to take your medications if something changes.',
  },
  {
    question: 'What about medications I only take sometimes?',
    answer:
      'As-needed medications stay out of the pouches. They are sent in a vial on the schedule your doctor recommends, or when you request them.',
  },
] as const;

export function CarePackIntro({
  canRequest,
  comingSoon,
  onRequest,
}: {
  canRequest: boolean;
  comingSoon: boolean;
  onRequest: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#d8e4d8] bg-[#eef4ee] p-5 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5a6d4d]">
            Liivv CarePack
          </p>
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#5a6d4d]">
            Ontario only
          </span>
        </div>
        <h3 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-[#2d4a2d] sm:text-[1.7rem]">
          Your monthly medications, divided and sorted
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#5c564c] sm:text-[15px]">
          CarePack packages eligible medications into labeled pouches so the day is easier to
          follow. Never miss a dose — and there is no extra charge to use it.
        </p>
        <dl className="mt-5 grid gap-2 sm:grid-cols-3">
          {[
            ['Every 4 weeks', 'A new pack on a steady schedule'],
            ['28-day supply', 'Shipped to your door with tracking'],
            ['No extra charge', 'You pay your usual copay or deductible'],
          ].map(([title, detail]) => (
            <div className="rounded-xl bg-white/80 px-3 py-3" key={title}>
              <dt className="text-sm font-semibold text-[#2d4a2d]">{title}</dt>
              <dd className="mt-0.5 text-xs leading-relaxed text-[#5c564c]">{detail}</dd>
            </div>
          ))}
        </dl>
        {comingSoon ? (
          <p className="mt-4 text-sm font-medium text-[#2d4a2d]">
            Available in Ontario today. The rest of Canada is coming soon.
          </p>
        ) : (
          <div className="mt-5">
            <button
              className="liivv-btn-primary px-4 py-2.5 text-sm disabled:opacity-40"
              disabled={!canRequest}
              onClick={onRequest}
              type="button"
            >
              Request CarePack
            </button>
            {canRequest ? null : (
              <p className="mt-2 text-xs text-[#6b6560]">
                Add an active tablet prescription before you request CarePack. Other medications can
                still ship alongside the pouches.
              </p>
            )}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#2c2a26]">What you get</h4>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {benefits.map((item) => (
            <li
              className="rounded-xl border border-[#e5dfd5] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              key={item.title}
            >
              <p className="text-sm font-semibold text-[#2c2a26]">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#6b6560]">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#e5dfd5] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-6">
        <h4 className="text-sm font-semibold text-[#2c2a26]">How CarePack works</h4>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5a6d4d]">
                Step {index + 1}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#2c2a26]">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#6b6560]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#2c2a26]">Common questions</h4>
        <div className="mt-3 space-y-2">
          {faqs.map((item) => (
            <details
              className="group rounded-xl border border-[#e5dfd5] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              key={item.question}
            >
              <summary className="cursor-pointer list-none text-sm font-medium text-[#2c2a26] [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3">
                  {item.question}
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-lg leading-none text-[#8a8176] transition group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[#5c564c]">{item.answer}</p>
            </details>
          ))}
        </div>
        <p className="mt-3 text-sm text-[#6b6560]">
          Questions about a change or an upcoming shipment?{' '}
          <Link className="font-medium text-[#375a37] underline-offset-2 hover:underline" href="/account/virtual-care">
            Message the pharmacy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
