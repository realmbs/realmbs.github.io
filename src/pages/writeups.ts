import { getWriteups } from '../markdown.ts'
import { renderWriteupCard } from '../components/writeup-card.ts'

export function render(container: HTMLElement, _params: Record<string, string>): void {
  const writeups = getWriteups()
  const cards = writeups.map(renderWriteupCard).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Writeups</h1>
      <p class="page-header__subtitle">OSCP lab writeups</p>
    </div>
    <div class="card-grid">
      ${cards.length ? cards : '<p>No writeups yet. Check back soon.</p>'}
    </div>
  `
}
