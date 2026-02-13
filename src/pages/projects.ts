import type { Project } from '../types/index.ts'
import projects from '../data/projects.json'
import { renderProjectCard } from '../components/project-card.ts'

export function render(container: HTMLElement, _params: Record<string, string>): void {
  const cards = (projects as Project[]).map(renderProjectCard).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Projects</h1>
      <p class="page-header__subtitle">View my projects</p>
    </div>
    <div class="card-grid">
      ${cards}
    </div>
  `
}
