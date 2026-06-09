// Phase 1 shell — proves the token theme + self-hosted font render.
// Replaced by the full page in Phase 2.
export default function App() {
  return (
    <main className="wrap" style={{ paddingBlock: '24vh' }}>
      <p className="label">Cybersecurity × Business Development</p>
      <h1
        style={{
          margin: '24px 0',
          fontSize: 'clamp(54px, 12vw, 180px)',
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 0.9,
          textTransform: 'uppercase',
        }}
      >
        Mark
        <br />
        Blaha
      </h1>
      <p style={{ color: 'var(--accent)' }}>Token theme online.</p>
    </main>
  )
}
