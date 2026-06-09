import { lazy, Suspense } from 'react'

const ArchitectureDiagram = lazy(
  () => import('./architecture/ArchitectureDiagram'),
)

export default function Capstone() {
  return (
    <section className="section" id="capstone" aria-labelledby="capstone-h">
      <div className="section-head reveal">
        <span className="num" aria-hidden="true">
          02
        </span>
        <h2 id="capstone-h">Capstone</h2>
      </div>

      <h3 className="capstone-name reveal">
        Threat-Intel
        <br />
        Platform
      </h3>

      <p className="capstone-desc reveal">
        A <b>cloud-native threat-intelligence platform</b> that aggregates
        indicators of compromise from live feeds into a single STIX&nbsp;2.1
        store — built for small businesses and designed to be run by one
        non-technical operator.
      </p>

      <div className="metrics reveal">
        <div className="metric">
          <span className="figure">$0.82</span>
          <span className="cap">Total cost to build &amp; run</span>
        </div>
        <div className="metric">
          <span className="figure">32,000+</span>
          <span className="cap">IOCs aggregated</span>
        </div>
        <div className="metric">
          <span className="figure">$12–120</span>
          <span className="cap">Projected annual cost</span>
        </div>
        <div className="metric">
          <span className="figure">2 feeds</span>
          <span className="cap">Live sources · STIX 2.1</span>
        </div>
      </div>

      <div className="stack-row reveal">
        <span className="chip">AWS Lambda · Python</span>
        <span className="chip">DynamoDB</span>
        <span className="chip">S3</span>
        <span className="chip">API Gateway</span>
        <span className="chip">STIX 2.1</span>
      </div>

      <div className="callout reveal">
        <span className="mk" aria-hidden="true" />
        <p>
          Engineered to be operated by a <b>single non-technical user</b> — no
          dedicated security team required.
        </p>
      </div>

      <div className="capstone-arch reveal">
        <Suspense
          fallback={<div className="capstone-arch-loading" aria-hidden="true" />}
        >
          <ArchitectureDiagram />
        </Suspense>
      </div>
    </section>
  )
}
