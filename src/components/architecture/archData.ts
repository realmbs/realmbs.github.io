// Architecture model for the Cloud Native Threat Intelligence Platform.
// Ported from the Claude Design handoff (data.jsx + app.jsx captions), final
// audited state: no foundation rail, no eyebrow, Shodan routed through the
// gateway, step 7 = processor → dashboard.
// Coordinate space: 1480 x 616 canvas (the design's header band is dropped —
// the surrounding Capstone section already carries the title + metrics — so
// every node y is shifted up 104px from the original 1480 x 720 canvas).

export const CANVAS_W = 1480
export const CANVAS_H = 616
export const TIER_TOP = 12
export const MAX_STEP = 7

export type IconName =
  | 'feed'
  | 'globe'
  | 'gateway'
  | 'lambda'
  | 'db'
  | 'bucket'
  | 'dashboard'
export type Side = 'l' | 'r' | 't' | 'b'

export type Endpoint = { path: string; desc: string }
export type Detail = {
  kind: string
  points?: [string, string][]
  config?: [string, string][]
  steps?: string[]
  tables?: { name: string; desc: string }[]
  gsis?: string[]
}
export type ArchNode = {
  id: string
  tier: string
  icon: IconName
  label: string
  sub: string
  x: number
  y: number
  w: number
  h: number
  blurb: string
  isGateway?: boolean
  endpoints?: Endpoint[]
  detail?: Detail
}
export type Edge = {
  from: { id: string; side: Side; t?: number }
  to: { id: string; side: Side; t?: number }
  step?: number
  label?: string
  dashed?: boolean
  bidir?: boolean
}

export const TIERS: { id: string; label: string; x: number; w: number }[] = [
  { id: 'sources', label: 'External feeds', x: 24, w: 250 },
  { id: 'gateway', label: 'API Gateway', x: 330, w: 206 },
  { id: 'compute', label: 'Compute · Lambda', x: 596, w: 214 },
  { id: 'storage', label: 'Storage', x: 880, w: 230 },
  { id: 'present', label: 'Presentation', x: 1190, w: 234 },
]

export const NODES: ArchNode[] = [
  // ── External feeds ───────────────────────────────────────────────
  {
    id: 'otx',
    tier: 'sources',
    icon: 'feed',
    label: 'AlienVault OTX',
    sub: 'Open Threat Exchange',
    x: 24,
    y: 64,
    w: 250,
    h: 78,
    blurb: 'Primary open source CTI feed. Pulled on demand for fresh indicators.',
    detail: {
      kind: 'External API',
      points: [
        ['Role', 'Primary live TI source - community CTI feed'],
        ['Auth', 'API key stored in AWS Secrets Manager'],
        ['Pulled by', 'collector.py via /collect'],
        ['Format', 'Raw JSON → normalized to STIX 2.1'],
      ],
    },
  },
  {
    id: 'abusech',
    tier: 'sources',
    icon: 'feed',
    label: 'Abuse.ch',
    sub: 'Secondary feed · redundancy',
    x: 24,
    y: 166,
    w: 250,
    h: 78,
    blurb: 'Second live source added for source redundancy and broader coverage.',
    detail: {
      kind: 'External API',
      points: [
        ['Role', 'Secondary CTI source - redundancy & coverage'],
        ['Auth', 'API key in AWS Secrets Manager'],
        ['Pulled by', 'collector.py via /collect'],
        ['Mitigates', 'External API rate limit / outage risk'],
      ],
    },
  },
  {
    id: 'shodan',
    tier: 'sources',
    icon: 'globe',
    label: 'Shodan API',
    sub: 'External enrichment source',
    x: 24,
    y: 508,
    w: 250,
    h: 78,
    blurb:
      'Adds real world context: geolocation, open ports, org & ISP identification.',
    detail: {
      kind: 'Enrichment API',
      points: [
        ['Role', 'On-demand enrichment of stored indicators'],
        ['Adds', 'Geolocation (country / city / coords)'],
        ['Adds', 'Open ports & services, org + ISP detection'],
        ['Consumed by', '/enrich endpoint → enrichment.py'],
      ],
    },
  },

  // ── API Gateway ──────────────────────────────────────────────────
  {
    id: 'gateway',
    tier: 'gateway',
    icon: 'gateway',
    label: 'API Gateway',
    sub: 'HTTPS · rate limited',
    x: 330,
    y: 136,
    w: 206,
    h: 222,
    isGateway: true,
    endpoints: [
      { path: '/collect', desc: 'Trigger fresh CTI collection' },
      { path: '/search', desc: 'Query stored indicators' },
      { path: '/enrich', desc: 'Enrich a data point via the Shodan API' },
    ],
    blurb:
      'Three REST endpoints. TLS encryption in transit, rate limiting to prevent abuse and cap cloud cost.',
    detail: {
      kind: 'Amazon API Gateway',
      points: [
        ['/collect', 'Pulls fresh CTI from connected sources'],
        ['/search', 'Search query API for the dashboard'],
        ['/enrich', 'Initiates Shodan enrichment for a data point'],
        ['Security', 'HTTPS / TLS in transit · per-endpoint rate limiting'],
        ['Note', 'Deployed via AWS CLI (hybrid strategy)'],
      ],
    },
  },

  // ── Compute / Lambda ─────────────────────────────────────────────
  {
    id: 'collector',
    tier: 'compute',
    icon: 'lambda',
    label: 'collector.py',
    sub: '256 MB · 5 min · Py 3.11',
    x: 596,
    y: 46,
    w: 214,
    h: 90,
    blurb:
      'Pulls feeds, normalizes everything to STIX 2.1, archives raw responses, writes indicators.',
    detail: {
      kind: 'Lambda · Collection',
      config: [
        ['Memory', '256 MB'],
        ['Timeout', '5 min'],
        ['Runtime', 'Python 3.11'],
      ],
      steps: [
        'Retrieve API keys from Secrets Manager',
        'Connect to OTX + Abuse.ch, pull TI feeds',
        'Parse responses, normalize to STIX 2.1',
        'Archive raw responses to S3 raw bucket',
        'Write processed indicators to DynamoDB',
        'Hash-based de-duplication via de-dup table',
      ],
    },
  },
  {
    id: 'processor',
    tier: 'compute',
    icon: 'lambda',
    label: 'processor.py',
    sub: '512 MB · 5 min · Py 3.11',
    x: 596,
    y: 268,
    w: 214,
    h: 90,
    blurb:
      'Handles all search queries - runs GSI lookups against DynamoDB and returns JSON.',
    detail: {
      kind: 'Lambda · Processing',
      config: [
        ['Memory', '512 MB'],
        ['Timeout', '5 min'],
        ['Runtime', 'Python 3.11'],
      ],
      steps: [
        'Handle search queries from frontend / API',
        'Run DynamoDB queries using GSIs',
        'Hash-based de-dup & DB write operations',
        'Return JSON to endpoint',
      ],
    },
  },
  {
    id: 'enrichment',
    tier: 'compute',
    icon: 'lambda',
    label: 'enrichment.py',
    sub: '1024 MB · 5 min · Py 3.11',
    x: 596,
    y: 490,
    w: 214,
    h: 90,
    blurb:
      'Calls Shodan + WHOIS to turn raw IOCs into human-readable, actionable intelligence.',
    detail: {
      kind: 'Lambda · Enrichment',
      config: [
        ['Memory', '1024 MB'],
        ['Timeout', '5 min'],
        ['Runtime', 'Python 3.11'],
      ],
      steps: [
        'Receive data points needing enrichment',
        'Query Shodan API for context',
        'Perform WHOIS domain lookup',
        'Store enrichment results in DynamoDB',
        'Return enriched data to endpoint',
      ],
    },
  },

  // ── Storage ──────────────────────────────────────────────────────
  {
    id: 'dynamodb',
    tier: 'storage',
    icon: 'db',
    label: 'DynamoDB',
    sub: '3 tables · 6 GSIs · encrypted',
    x: 880,
    y: 126,
    w: 230,
    h: 116,
    blurb:
      'Primary structured store. Serverless billing, encrypted at rest, 6 GSIs power every search.',
    detail: {
      kind: 'Amazon DynamoDB',
      tables: [
        {
          name: 'Main TI Table',
          desc: 'STIX object id (PK) · object type (SK) · confidence, risk, IOC type…',
        },
        { name: 'De-duplication Table', desc: 'content hash (PK) · TTL expiry' },
        {
          name: 'OSINT Enrichment Table',
          desc: 'observable value (PK) · enrichment type (SK) · TTL',
        },
      ],
      gsis: [
        'TIME-INDEX',
        'SOURCE-INDEX',
        'PATTERN-HASH-INDEX',
        'RISK-ANALYTICS-INDEX',
        'GEOGRAPHIC-INDEX',
        'IOC-PATTERN-INDEX',
      ],
      points: [
        ['Encryption', 'At rest by default'],
        ['Billing', 'Serverless - scales with data volume'],
      ],
    },
  },
  {
    id: 's3',
    tier: 'storage',
    icon: 'bucket',
    label: 'Amazon S3',
    sub: '3 buckets · lifecycle policies',
    x: 880,
    y: 364,
    w: 230,
    h: 116,
    blurb:
      'Raw archive, processed STIX store, and static dashboard hosting. 90-day lifecycle to cut cost.',
    detail: {
      kind: 'Amazon S3',
      tables: [
        {
          name: 'Raw data bucket',
          desc: 'Archives original API responses · → Standard-IA after 90 days',
        },
        {
          name: 'Processed data bucket',
          desc: 'STIX 2.1 formatted data for long-term retention',
        },
        {
          name: 'Frontend bucket',
          desc: 'Static website hosting for the dashboard',
        },
      ],
      points: [
        ['Lifecycle', 'Transition to lower-cost tier after 90 days'],
        ['Cost', 'Static hosting chosen for minimal spend'],
      ],
    },
  },

  // ── Presentation ─────────────────────────────────────────────────
  {
    id: 'dashboard',
    tier: 'present',
    icon: 'dashboard',
    label: 'Threat Dashboard',
    sub: 'Vanilla TS · Tailwind · Chart.js · Leaflet',
    x: 1190,
    y: 216,
    w: 234,
    h: 138,
    blurb:
      'Data-driven dashboard built for non-experts: live metrics, geo heatmap, and analytics at a glance.',
    detail: {
      kind: 'Frontend Dashboard',
      points: [
        ['Metrics', 'Total IOCs · high-risk · recent activity · sources'],
        ['Map', 'Leaflet heatmap of top IOC geolocations'],
        ['Analytics', 'Chart.js - IOC type, confidence, source effectiveness'],
        ['Search', 'Partial-match lookup with manual enrichment'],
        ['Audience', 'Operable by one non-technical person'],
      ],
    },
  },
]

// Edges. from/to: { id, side: 'l'|'r'|'t'|'b', t: 0..1 along that side }
export const EDGES: Edge[] = [
  { from: { id: 'otx', side: 'r' }, to: { id: 'gateway', side: 'l', t: 0.18 }, step: 1 },
  { from: { id: 'abusech', side: 'r' }, to: { id: 'gateway', side: 'l', t: 0.18 } },
  { from: { id: 'gateway', side: 'r', t: 0.15 }, to: { id: 'collector', side: 'l' }, step: 2 },
  { from: { id: 'collector', side: 'r', t: 0.35 }, to: { id: 's3', side: 'l', t: 0.2 }, label: 'archive', step: 3 },
  { from: { id: 'collector', side: 'r', t: 0.65 }, to: { id: 'dynamodb', side: 'l', t: 0.35 }, label: 'STIX 2.1', step: 4 },
  { from: { id: 'gateway', side: 'r', t: 0.5 }, to: { id: 'processor', side: 'l' }, step: 5 },
  { from: { id: 'processor', side: 'r', t: 0.35 }, to: { id: 'dynamodb', side: 'l', t: 0.7 }, bidir: true },
  { from: { id: 'gateway', side: 'r', t: 0.85 }, to: { id: 'enrichment', side: 'l' }, step: 6 },
  { from: { id: 'shodan', side: 'r' }, to: { id: 'gateway', side: 'l', t: 0.85 } },
  { from: { id: 'enrichment', side: 'r' }, to: { id: 'dynamodb', side: 'b', t: 0.5 } },
  { from: { id: 'processor', side: 'r', t: 0.72 }, to: { id: 'dashboard', side: 'l', t: 0.4 }, label: 'JSON results', step: 7 },
  { from: { id: 's3', side: 'r' }, to: { id: 'dashboard', side: 'l', t: 0.72 }, label: 'hosting', dashed: true },
]

export const STEP_CAPTIONS: Record<number, string> = {
  1: 'Open source feeds (OTX & Abuse.ch) enter via the API Gateway /collect endpoint',
  2: 'API Gateway invokes collector.py - responses normalized to STIX 2.1',
  3: 'collector.py archives the raw API responses to the S3 raw bucket',
  4: 'collector.py writes STIX 2.1 indicators to DynamoDB + hash de-dup',
  5: '/search invokes processor.py - GSI queries against DynamoDB',
  6: '/enrich invokes enrichment.py - Shodan + WHOIS enrichment, OSINT stored',
  7: 'processor.py returns JSON results to the dashboard',
}
