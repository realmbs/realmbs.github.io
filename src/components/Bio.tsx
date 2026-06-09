export default function Bio() {
  return (
    <section className="section" id="profile" aria-labelledby="profile-h">
      <div className="section-head reveal">
        <span className="num" aria-hidden="true">
          01
        </span>
        <h2 id="profile-h">Profile</h2>
      </div>
      <div className="bio-grid">
        <p className="bio-body reveal">
          Mark Blaha builds <b>cloud-native security tooling</b> that small teams
          can actually run — and the business case that makes it worth running.
          His work sits where threat intelligence meets go-to-market: serverless
          systems engineered for near-zero cost and non-technical operators.
        </p>
        <div className="bio-meta reveal">
          <div className="row">
            <span className="k">Focus</span>
            <span className="v">Threat intel · GTM</span>
          </div>
          <div className="row">
            <span className="k">Stack</span>
            <span className="v">AWS · Python</span>
          </div>
          <div className="row">
            <span className="k">Seeking</span>
            <span className="v">Grad programs · 2026</span>
          </div>
          <div className="row">
            <span className="k">Open to</span>
            <span className="v">Research · Product</span>
          </div>
        </div>
      </div>
    </section>
  )
}
