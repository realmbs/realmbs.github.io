import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'
import './architecture.css'
import {
  CANVAS_H,
  CANVAS_W,
  EDGES,
  MAX_STEP,
  NODES,
  STEP_CAPTIONS,
  TIERS,
  type ArchNode,
  type Side,
} from './archData'

const MIN_SCALE = 0.62

// ── geometry ───────────────────────────────────────────────────────
type Anchor = { x: number; y: number; dx: number; dy: number }

function anchor(n: ArchNode, side: Side, t = 0.5): Anchor {
  switch (side) {
    case 'l':
      return { x: n.x, y: n.y + n.h * t, dx: -1, dy: 0 }
    case 'r':
      return { x: n.x + n.w, y: n.y + n.h * t, dx: 1, dy: 0 }
    case 't':
      return { x: n.x + n.w * t, y: n.y, dx: 0, dy: -1 }
    case 'b':
      return { x: n.x + n.w * t, y: n.y + n.h, dx: 0, dy: 1 }
  }
}

function edgeGeom(a: Anchor, b: Anchor) {
  const dist = Math.hypot(b.x - a.x, b.y - a.y)
  const len = Math.max(48, dist * 0.42)
  const c1 = { x: a.x + a.dx * len, y: a.y + a.dy * len }
  const c2 = { x: b.x + b.dx * len, y: b.y + b.dy * len }
  const path = `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`
  const mt = (p0: number, p1: number, p2: number, p3: number) =>
    0.125 * p0 + 0.375 * p1 + 0.375 * p2 + 0.125 * p3
  const mid = { x: mt(a.x, c1.x, c2.x, b.x), y: mt(a.y, c1.y, c2.y, b.y) }
  const ang = (Math.atan2(-b.dy, -b.dx) * 180) / Math.PI // arrow points into target
  return { path, mid, arrow: { x: b.x, y: b.y, ang } }
}

// Vertical separator positions: midpoints of the gaps between tiers.
const SEPARATORS = TIERS.slice(1).map((tier, i) => {
  const prev = TIERS[i]
  return (prev.x + prev.w + tier.x) / 2
})

// ── responsive fit: scale by container width, floor for mobile pan ─
function useFit(ref: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(MIN_SCALE)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () =>
      setScale(Math.max(Math.min(el.clientWidth / CANVAS_W, 1), MIN_SCALE))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return scale
}

function useInView(ref: RefObject<Element | null>, threshold = 0.05) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
  return inView
}

// ── connectors ─────────────────────────────────────────────────────
function Connectors({
  byId,
  flow,
  activeStep,
  hoverId,
}: {
  byId: Record<string, ArchNode>
  flow: boolean
  activeStep: number | null
  hoverId: string | null
}) {
  return (
    <svg
      className="ad-wires"
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {EDGES.map((e, i) => {
        const fn = byId[e.from.id]
        const tn = byId[e.to.id]
        if (!fn || !tn) return null
        const a = anchor(fn, e.from.side, e.from.t ?? 0.5)
        const b = anchor(tn, e.to.side, e.to.t ?? 0.5)
        const g = edgeGeom(a, b)
        const lit = !!hoverId && (e.from.id === hoverId || e.to.id === hoverId)
        const on = lit || (!!activeStep && e.step === activeStep)
        const faded = !!activeStep && e.step !== activeStep && !lit
        return (
          <g
            key={i}
            className={`ad-edge${on ? ' on' : ''}${faded ? ' faded' : ''}`}
            style={{ '--d': i } as CSSProperties}
          >
            {e.dashed ? (
              <path d={g.path} className="ad-edge-base is-dashed" strokeDasharray="2 7" />
            ) : (
              // pathLength=1 normalizes the draw-in animation (dashoffset 1 → 0).
              <path d={g.path} className="ad-edge-base" pathLength={1} />
            )}
            {flow && (
              <path
                d={g.path}
                className="ad-edge-flow"
                pathLength={100}
                style={{ animationDelay: `${(i % 6) * -0.45}s` }}
              />
            )}
            <g transform={`translate(${g.arrow.x} ${g.arrow.y}) rotate(${g.arrow.ang})`}>
              <path d="M 0 0 L -8 -4 L -8 4 Z" className="ad-edge-arrow" />
            </g>
            {e.bidir && (
              <g
                transform={`translate(${a.x} ${a.y}) rotate(${(Math.atan2(-a.dy, -a.dx) * 180) / Math.PI})`}
              >
                <path d="M 0 0 L -8 -4 L -8 4 Z" className="ad-edge-arrow" />
              </g>
            )}
            {e.step && (
              <g transform={`translate(${g.mid.x} ${g.mid.y})`} className="ad-step-badge">
                <rect x="-10" y="-10" width="20" height="20" rx="2" />
                <text dy="4">{e.step}</text>
              </g>
            )}
            {e.label && !e.step && (
              <g transform={`translate(${g.mid.x} ${g.mid.y})`} className="ad-edge-label">
                <text dy="-5">{e.label}</text>
              </g>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── node card ──────────────────────────────────────────────────────
function NodeCard({
  n,
  index,
  onOpen,
  onHover,
  dim,
  lit,
}: {
  n: ArchNode
  index: number
  onOpen: (n: ArchNode) => void
  onHover: (id: string | null) => void
  dim: boolean
  lit: boolean
}) {
  return (
    <button
      type="button"
      className={`ad-node${dim ? ' dim' : ''}${lit ? ' lit' : ''}`}
      style={
        { left: n.x, top: n.y, width: n.w, height: n.h, '--d': index } as CSSProperties
      }
      onClick={() => onOpen(n)}
      onMouseEnter={() => onHover(n.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(n.id)}
      onBlur={() => onHover(null)}
      aria-label={`${n.label} — ${n.sub}. Open details.`}
    >
      <span className="ad-node-bar" />
      <span className="ad-node-row">
        <span className="ad-node-ico">
          <Icon name={n.icon} size={20} />
        </span>
        <span className="ad-node-txt">
          <span className="ad-node-label">{n.label}</span>
          <span className="ad-node-sub">{n.sub}</span>
        </span>
        <span className="ad-node-plus" aria-hidden="true">
          +
        </span>
      </span>
      {n.isGateway && n.endpoints && (
        <span className="ad-ep-list">
          {n.endpoints.map((ep) => (
            <span className="ad-ep" key={ep.path}>
              <code>{ep.path}</code>
              <span>{ep.desc}</span>
            </span>
          ))}
        </span>
      )}
    </button>
  )
}

// ── detail drawer ──────────────────────────────────────────────────
function Drawer({ node, onClose }: { node: ArchNode | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!node) return
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    // The drawer is portaled outside #root, so inerting the app root keeps
    // keyboard focus inside the dialog, as aria-modal promises.
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      root?.removeAttribute('inert')
      prev?.focus?.()
    }
  }, [node, onClose])

  if (!node) return null
  const d = node.detail ?? { kind: '' }
  // Portal to <body> so no transformed/clipping ancestor (e.g. the .reveal
  // wrapper's transform) can trap the fixed-position drawer inside the figure.
  return createPortal(
    <div className="archdiagram is-in ad-drawer-scrim" onClick={onClose}>
      <aside
        className="ad-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${node.label} details`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ad-drawer-x" onClick={onClose} ref={closeRef} aria-label="Close details">
          ✕
        </button>
        <span className="ad-drawer-kind">
          <Icon name={node.icon} size={15} />
          <span>{d.kind}</span>
        </span>
        <h3>{node.label}</h3>
        <p className="ad-drawer-blurb">{node.blurb}</p>

        {d.config && (
          <div className="ad-cfg">
            {d.config.map(([k, v]) => (
              <div key={k}>
                <b>{v}</b>
                <span>{k}</span>
              </div>
            ))}
          </div>
        )}
        {d.steps && (
          <ol className="ad-steps">
            {d.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        )}
        {d.tables && (
          <div className="ad-tbls">
            {d.tables.map((t) => (
              <div className="ad-tbl" key={t.name}>
                <b>{t.name}</b>
                <span>{t.desc}</span>
              </div>
            ))}
          </div>
        )}
        {d.gsis && (
          <div className="ad-gsis">
            <div className="ad-gsis-h">Global Secondary Indexes</div>
            <div className="ad-gsis-wrap">
              {d.gsis.map((g) => (
                <code key={g}>{g}</code>
              ))}
            </div>
          </div>
        )}
        {d.points && (
          <dl className="ad-kv">
            {d.points.map(([k, v], i) => (
              <div key={i}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </aside>
    </div>,
    document.body,
  )
}

// ── diagram ────────────────────────────────────────────────────────
export default function ArchitectureDiagram() {
  const figureRef = useRef<HTMLElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scale = useFit(scrollRef)
  const inView = useInView(figureRef)

  const [open, setOpen] = useState<ArchNode | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [step, setStep] = useState(0) // 0 = off
  // Entrance choreography runs once, the first time the figure is seen.
  // Latched during render (not an effect) — inView already triggers this render.
  const [seen, setSeen] = useState(false)
  if (inView && !seen) setSeen(true)
  // Stable identity — the Drawer effect depends on it.
  const closeDrawer = useCallback(() => setOpen(null), [])

  const byId: Record<string, ArchNode> = {}
  NODES.forEach((n) => (byId[n.id] = n))

  const hoverNode = hover ? byId[hover] : null
  const connected = new Set<string>()
  if (hover) {
    connected.add(hover)
    EDGES.forEach((e) => {
      if (e.from.id === hover) connected.add(e.to.id)
      if (e.to.id === hover) connected.add(e.from.id)
    })
  }

  // Nodes touched by the active walkthrough step light up; the rest recede.
  const stepIds = new Set<string>()
  if (step) {
    EDGES.forEach((e) => {
      if (e.step === step) {
        stepIds.add(e.from.id)
        stepIds.add(e.to.id)
      }
    })
  }

  return (
    <figure
      className={`archdiagram${seen ? ' is-in' : ''}`}
      ref={figureRef}
      aria-label="Interactive architecture diagram of the threat intelligence platform - external feeds through API Gateway and Lambda functions to DynamoDB, S3, and the dashboard. Use the node buttons for component details."
    >
      <div className="ad-head">
        <span className="ad-fig">
          <i>Fig. 01</i> Event-driven pipeline
        </span>
        <span className="ad-legend" aria-hidden="true">
          <span>
            <i className="lg-solid" /> data flow
          </span>
          <span>
            <i className="lg-dashed" /> static hosting
          </span>
          <span>
            <i className="lg-step">4</i> walkthrough step
          </span>
        </span>
      </div>

      <div className="ad-scroll" ref={scrollRef}>
        {/* `zoom` scales the layout box (Safari-safe), unlike transform:scale,
            which WebKit mis-clips inside an overflow container. */}
        <div className="ad-stage" style={{ zoom: scale } as CSSProperties}>
          {TIERS.map((tier, i) => (
            <div className="ad-tier" key={tier.id} style={{ left: tier.x, width: tier.w }}>
              <i>{`0${i + 1}`}</i>
              {tier.label}
            </div>
          ))}

          {SEPARATORS.map((x) => (
            <span className="ad-sep" key={x} style={{ left: x }} aria-hidden="true" />
          ))}

          <Connectors byId={byId} flow={inView} activeStep={step || null} hoverId={hover} />

          {NODES.map((n, i) => (
            <NodeCard
              key={n.id}
              n={n}
              index={i}
              onOpen={setOpen}
              onHover={setHover}
              dim={(!!hover && !connected.has(n.id)) || (!!step && !stepIds.has(n.id))}
              lit={!!step && stepIds.has(n.id)}
            />
          ))}

          {hoverNode && (
            <div
              className="ad-tip"
              style={
                // Flip above the node when a below-tip would be clipped by the
                // stage bottom (the scroll container hides vertical overflow).
                hoverNode.y + hoverNode.h + 106 > CANVAS_H
                  ? {
                    left: Math.min(hoverNode.x, CANVAS_W - 280),
                    top: hoverNode.y - 10,
                    transform: 'translateY(-100%)',
                  }
                  : {
                    left: Math.min(hoverNode.x, CANVAS_W - 280),
                    top: hoverNode.y + hoverNode.h + 10,
                  }
              }
            >
              {hoverNode.blurb}
            </div>
          )}
        </div>
      </div>

      <figcaption className="ad-controls">
        <div className="ad-walk">
          <span className="ad-walk-title">Data flow walkthrough</span>
          {/* aria-disabled (not disabled) so a focused button at a bound
              never drops keyboard focus to <body>; clamps make them no-ops. */}
          <div className="ad-walk-btns">
            <button onClick={() => setStep((s) => Math.max(0, s - 1))} aria-disabled={step === 0}>
              ‹ Prev
            </button>
            <span className="ad-walk-count">{step === 0 ? 'off' : `${step} / ${MAX_STEP}`}</span>
            <button
              onClick={() => setStep((s) => Math.min(MAX_STEP, s + 1))}
              aria-disabled={step === MAX_STEP}
            >
              Next ›
            </button>
            <button onClick={() => setStep(0)} aria-disabled={step === 0}>
              Reset
            </button>
          </div>
          <div className="ad-dots" role="group" aria-label="Jump to walkthrough step">
            {Array.from({ length: MAX_STEP }, (_, i) => i + 1).map((s) => (
              <button
                key={s}
                className={`ad-dot${s === step ? ' now' : ''}${s < step ? ' done' : ''}`}
                onClick={() => setStep(s === step ? 0 : s)}
                aria-label={`Step ${s}${s === step ? ' (active — click to turn off)' : ''}`}
              />
            ))}
          </div>
        </div>

        <span className="ad-cap-area" aria-live="polite">
          {step > 0 ? (
            <span className="ad-caption">
              <span className="ad-wc-num">{step}</span>
              {STEP_CAPTIONS[step]}
            </span>
          ) : (
            <span className="ad-hint">
              Hover a service to trace its links · click any node for full detail
            </span>
          )}
        </span>
      </figcaption>

      <Drawer node={open} onClose={closeDrawer} />
    </figure>
  )
}
