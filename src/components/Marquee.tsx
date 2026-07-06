const ITEMS = [
  'Offensive Security',
  'Cloud Security',
  'AWS Serverless',
  'Terraform',
  'Python',
  'STIX 2.1',
  'Threat Intelligence',
  'Workflow Automation',
  'Business Development',
  'Cloud Architecture'
]

/** Decorative skills ticker - outline display type drifting between hairlines. */
export default function Marquee() {
  return (
    <div className="marquee border-y border-line" aria-hidden>
      <div className="marquee-inner">
        {[0, 1].map((copy) => (
          <div className="marquee-track" key={copy}>
            {ITEMS.map((item) => (
              <span key={item}>
                {item}
                <i>✦</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
