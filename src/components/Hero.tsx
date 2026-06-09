// Phase 2: static hero shell. The WebGL threat-map globe mounts in Phase 3 as a
// lazy-loaded island behind the overlay; the `.hero-poster` gradient below
// doubles as the prefers-reduced-motion / no-WebGL fallback.
export default function Hero() {
  return (
    <section className="hero" id="top" aria-label="Introduction">
      <div className="hero-poster" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <div className="hero-overlay">
        <p className="hero-kicker">
          <span className="rule" aria-hidden="true" />
          <span className="label">Cybersecurity × Business Development</span>
        </p>
        <h1 className="hero-name">
          <span className="ln">
            <span>Mark</span>
          </span>
          <span className="ln">
            <span>Blaha</span>
          </span>
        </h1>
        <p className="hero-tagline">
          I build <b>cloud-native security systems</b> — and the business case
          that gets them shipped, funded, and actually adopted.
        </p>
      </div>

      <div className="scroll-cue" aria-hidden="true">
        <span className="bar" />
      </div>
    </section>
  )
}
