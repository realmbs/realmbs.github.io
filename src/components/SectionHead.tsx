import { useReveal } from '../hooks'

export default function SectionHead({ index, title }: { index: string; title: string }) {
  const ref = useReveal()
  return (
    <div ref={ref} className="reveal mb-14 flex items-baseline gap-4 border-t border-line pt-6">
      <span className="t-label !text-acid">{index}</span>
      <h2 className="t-label !text-fg">{title}</h2>
    </div>
  )
}
