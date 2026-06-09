export default function Resume() {
  return (
    <section className="section" id="resume" aria-labelledby="resume-h">
      <div className="section-head reveal">
        <span className="num" aria-hidden="true">
          03
        </span>
        <h2 id="resume-h">Resume</h2>
      </div>
      <div className="resume-row reveal">
        <a
          className="resume-cta"
          href="/resume.pdf"
          target="_blank"
          rel="noopener"
          aria-label="Download resume PDF (opens in a new tab)"
        >
          Download resume
          <span className="arrow" aria-hidden="true">
            ↗
          </span>
        </a>
        <span className="resume-note">PDF · opens in a new tab</span>
      </div>
    </section>
  )
}
