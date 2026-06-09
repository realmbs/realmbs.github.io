import type { JSX } from 'react'
import type { IconName } from './archData'

// Abstract geometric service glyphs (not vendor logos), ported from icons.jsx.
const PATHS: Record<IconName, JSX.Element> = {
  feed: (
    <g>
      <circle cx="5" cy="19" r="1.6" fill="currentColor" stroke="none" />
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
    </g>
  ),
  globe: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
    </g>
  ),
  gateway: (
    <g>
      <path d="M8 4 4 8v8l4 4M16 4l4 4v8l-4 4" />
      <path d="M10 12h4" />
    </g>
  ),
  lambda: (
    <g>
      <path d="M7 5h3.2l4 9.2c.5 1.2 1.3 1.8 2.3 1.8H18" />
      <path d="M14 5 7.5 19" />
    </g>
  ),
  db: (
    <g>
      <ellipse cx="12" cy="5.5" rx="7" ry="2.6" />
      <path d="M5 5.5v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6" />
      <path d="M5 11.5v6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-6" />
    </g>
  ),
  bucket: (
    <g>
      <path d="M5 6h14l-1.4 13.2a1.5 1.5 0 0 1-1.5 1.3H7.9a1.5 1.5 0 0 1-1.5-1.3z" />
      <path d="M4 6h16" />
      <path d="M9.5 10v7M14.5 10v7" />
    </g>
  ),
  dashboard: (
    <g>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
      <path d="M8 13v3M12 12v4M16 14v2" />
    </g>
  ),
}

export default function Icon({
  name,
  size = 22,
  color = 'currentColor',
}: {
  name: IconName
  size?: number
  color?: string
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}
