export default function Resume() {
  return (
    <a
      href="/resume.pdf"
      target="_blank"
      rel="noreferrer"
      className="group relative block overflow-hidden border-y border-line"
    >
      {/* Acid fill sweeps up from the bottom edge on hover/focus. */}
      <span
        aria-hidden
        className="absolute inset-0 origin-bottom scale-y-0 bg-acid transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none"
      />
      <div className="shell relative flex items-center justify-between py-10 sm:py-14">
        <span className="text-[clamp(1.5rem,4.5vw,3rem)] font-medium tracking-[-0.02em] transition-colors duration-300 group-hover:text-ink group-focus-visible:text-ink">
          View my resume
        </span>
        <span
          className="inline-block text-[clamp(1.5rem,4.5vw,3rem)] text-acid transition-all duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-ink group-focus-visible:text-ink motion-reduce:transform-none"
          aria-hidden
        >
          ↗
        </span>
      </div>
    </a>
  )
}
