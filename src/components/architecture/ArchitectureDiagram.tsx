import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { useInView } from '../../hooks'
import Icon from './Icon'
import './architecture.css'
import {
  ACCENTS,
  CANVAS_H,
  CANVAS_W,
  EDGES,
  MAX_STEP,
  NODES,
  STEP_CAPTIONS,
  TIERS,
  type ArchNode,
  type Edge,
  type Side,
} from './archData'

type StyleVars = CSSProperties & Record<string, string | number>
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
  const mid = {
    x: mt(a.x, c1.x, c2.x, b.x),
    y: mt(a.y, c1.y, c2.y, b.y),
  }
  const ang = (Math.atan2(-b.dy, -b.dx) * 180) / Math.PI
  return { path, mid, arrow: { x: b.x, y: b.y, ang } }
}

// ── responsive fit (scale by container width) ──────────────────────
function useFit(ref: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(MIN_SCALE)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => setScale(Math.max(Math.min(el.clientWidth / CANVAS_W, 1), MIN_SCALE))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return scale
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
      {EDGES.map((e: Edge, i) => {
        const fn = byId[e.from.id]
        const tn = byId[e.to.id]
        if (!fn || !tn) return null
        const a = anchor(fn, e.from.side, e.from.t ?? 0.5)
        const b = anchor(tn, e.to.side, e.to.t ?? 0.5)
        const g = edgeGeom(a, b)
        const lit = !!hoverId && (e.from.id === hoverId || e.to.id === hoverId)
        const on = lit || (!!activeStep && e.step === activeStep)
        return (
          <g key={i} className={on ? 'ad-edge on' : 'ad-edge'}>
            <path
              d={g.path}
              className="ad-edge-base"
              strokeDasharray={e.dashed ? '2 7' : 'none'}
            />
            {flow && (
              <path
                d={g.path}
                className="ad-edge-flow"
                pathLength={100}
                style={{ animationDelay: `${(i % 6) * -0.45}s` }}
              />
            )}
            <g
              transform={`translate(${g.arrow.x} ${g.arrow.y}) rotate(${g.arrow.ang})`}
            >
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
              <g
                transform={`translate(${g.mid.x} ${g.mid.y})`}
                className="ad-step-badge"
              >
                <circle r="11" />
                <text dy="4">{e.step}</text>
              </g>
            )}
            {e.label && !e.step && (
              <g
                transform={`translate(${g.mid.x} ${g.mid.y})`}
                className="ad-edge-label"
              >
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
  onOpen,
  onHover,
  dim,
}: {
  n: ArchNode
  onOpen: (n: ArchNode) => void
  onHover: (id: string | null) => void
  dim: boolean
}) {
  const c = ACCENTS[n.accent]
  return (
    <button
      type="button"
      className={'ad-node' + (dim ? ' dim' : '')}
      style={{ left: n.x, top: n.y, width: n.w, height: n.h, '--c': c } as StyleVars}
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
          <Icon name={n.icon} size={20} color={c} />
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
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus?.()
    }
  }, [node, onClose])

  if (!node) return null
  const c = ACCENTS[node.accent]
  const d = node.detail ?? { kind: '' }
  // Portal to <body> so no transformed/clipping ancestor (e.g. the .reveal
  // wrapper's transform) can trap the fixed drawer inside the diagram box.
  // The `archdiagram` class re-supplies the scoped --ad-* theme vars.
  return createPortal(
    <div className="archdiagram ad-drawer-scrim" onClick={onClose}>
      <aside
        className="ad-drawer"
        style={{ '--c': c } as StyleVars}
        role="dialog"
        aria-modal="true"
        aria-label={`${node.label} details`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="ad-drawer-x"
          onClick={onClose}
          ref={closeRef}
          aria-label="Close details"
        >
          ✕
        </button>
        <span className="ad-drawer-kind">
          <Icon name={node.icon} size={16} color={c} />
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
  const figureRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scale = useFit(scrollRef)
  const inView = useInView(figureRef, 0.05)

  const [open, setOpen] = useState<ArchNode | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [step, setStep] = useState(0) // 0 = off

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

  return (
    <figure
      className="archdiagram"
      ref={figureRef}
      aria-label="Interactive cloud-architecture diagram of the threat-intelligence platform — external feeds through API Gateway and Lambda functions to DynamoDB, S3, and the dashboard. Use the node buttons for component details."
    >
      <div className="ad-scroll" ref={scrollRef}>
        {/* `zoom` scales the layout box (Safari-safe), unlike transform:scale
            which WebKit mis-clips inside an overflow container. */}
        <div className="ad-stage" style={{ zoom: scale }}>
          {TIERS.map((tier) => (
            <div
              className="ad-tier"
              key={tier.id}
              style={{ left: tier.x, width: tier.w }}
            >
              {tier.label}
            </div>
          ))}

          <Connectors
            byId={byId}
            flow={inView}
            activeStep={step || null}
            hoverId={hover}
          />

          {NODES.map((n) => (
            <NodeCard
              key={n.id}
              n={n}
              onOpen={setOpen}
              onHover={setHover}
              dim={!!hover && !connected.has(n.id)}
            />
          ))}

          {hoverNode && (
            <div
              className="ad-tip"
              style={{
                left: Math.min(hoverNode.x, CANVAS_W - 280),
                top: hoverNode.y + hoverNode.h + 10,
              }}
            >
              {hoverNode.blurb}
            </div>
          )}
        </div>
      </div>

      <div className="ad-controls">
        <div className="ad-walk">
          <span className="ad-walk-title">Data-flow walkthrough</span>
          <div className="ad-walk-btns">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              ‹ Prev
            </button>
            <span className="ad-walk-count">
              {step === 0 ? 'off' : `${step} / ${MAX_STEP}`}
            </span>
            <button
              onClick={() => setStep((s) => Math.min(MAX_STEP, s + 1))}
              disabled={step === MAX_STEP}
            >
              Next ›
            </button>
            {step > 0 && (
              <button onClick={() => setStep(0)}>Reset</button>
            )}
          </div>
        </div>

        {step > 0 ? (
          <p className="ad-caption">
            <span className="ad-wc-num">{step}</span>
            {STEP_CAPTIONS[step]}
          </p>
        ) : (
          <p className="ad-hint">
            Hover a service to trace its links · click any node for full detail
          </p>
        )}
      </div>

      <Drawer node={open} onClose={() => setOpen(null)} />
    </figure>
  )
}
