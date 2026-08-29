import { Brand } from '@/components/ui/Brand'

const previewCards = [
  { name: 'Website redesign', meta: 'On track' },
  { name: 'Q3 product launch', meta: '2 overdue' },
  { name: 'Design system', meta: 'In review' },
]

export function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="grid min-h-dvh grid-cols-[minmax(320px,0.92fr)_minmax(360px,1.08fr)] max-[860px]:grid-cols-1">
      <section
        className="relative flex flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(196,92,38,0.22),transparent_32%),linear-gradient(165deg,#18241d_0%,#141711_58%,#1e3a2f_100%)] px-11 pt-10 pb-9 text-paper max-[860px]:min-h-55 max-[860px]:p-6"
        aria-hidden="true"
      >
        <div className="pointer-events-none absolute -top-20 -right-30 size-105 rounded-full border border-paper/12 max-[860px]:hidden" />
        <div className="pointer-events-none absolute top-10 -right-10 size-70 rounded-full border border-paper/12 max-[860px]:hidden" />
        <Brand inverted className="relative z-10" />
        <div className="relative z-10 max-w-105">
          <p className="mb-2.5 text-[0.8rem] tracking-[0.16em] text-[#d7c4b0] uppercase">
            Project command
          </p>
          <p className="font-display text-[clamp(2.1rem,3vw,3.3rem)] leading-[1.12] font-medium max-[860px]:text-[2rem]">
            See the work. Steer the team.
          </p>
          <p className="mt-4 max-w-[34ch] text-paper/78">
            Projects, owners, and deadlines in one quiet workspace.
          </p>
        </div>
        <div className="relative z-10 grid max-w-90 gap-2.5 max-[860px]:hidden">
          {previewCards.map((card) => (
            <article
              key={card.name}
              className="flex justify-between gap-3 rounded-[14px] border border-paper/10 bg-paper-raised/6 px-4 py-3.5 backdrop-blur-sm"
            >
              <p className="m-0 text-[0.95rem]">{card.name}</p>
              <p className="m-0 text-[0.8rem] text-[#e0c3a8]">{card.meta}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="grid place-items-center px-4 py-6 sm:px-6 sm:py-8">
        <div className="w-full max-w-105">
          <h1 className="m-0 font-display text-[clamp(1.75rem,4vw,2.15rem)] tracking-[-0.03em] font-medium">
            {title}
          </h1>
          <p className="mt-2.5 mb-7 text-ink-soft">{subtitle}</p>
          {children}
          {footer && (
            <p className="mt-6 text-center text-ink-soft [&_a]:no-underline [&_a:hover]:no-underline">
              {footer}
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
