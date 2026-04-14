export default function PageMasthead({ eyebrow, title, accent, lead }) {
  return (
    <section className="max-w-5xl w-full mx-auto px-8 pt-20 pb-10 max-md:px-6 max-md:pt-16 max-sm:px-4 max-sm:pt-12">
      <span className="inline-block text-xs font-semibold uppercase tracking-wide text-secondary bg-secondary/12 px-3 py-1 rounded-full">
        {eyebrow}
      </span>
      <h1 className="font-display text-[clamp(2.5rem,5.5vw,4rem)] font-normal leading-[1.05] tracking-tight mt-4 text-on-surface">
        {title} <span className="text-primary">{accent}</span>
      </h1>
      <div className="w-8 h-0.5 bg-primary mt-5" aria-hidden="true" />
      <p className="mt-5 text-lg leading-relaxed text-on-surface-variant max-w-[60ch]">{lead}</p>
    </section>
  )
}
