export default function Resume() {
  return (
    <a
      href="/resume.pdf"
      target="_blank"
      rel="noreferrer"
      className="group block border-y border-line transition-colors duration-300 hover:bg-acid"
    >
      <div className="shell flex items-center justify-between py-10 sm:py-14">
        <span className="text-[clamp(1.5rem,4.5vw,3rem)] font-medium tracking-[-0.02em] transition-colors duration-300 group-hover:text-ink">
          View the résumé
        </span>
        <span
          className="text-[clamp(1.5rem,4.5vw,3rem)] text-acid transition-colors duration-300 group-hover:text-ink"
          aria-hidden
        >
          ↗
        </span>
      </div>
    </a>
  )
}
