import type { Project } from '../types/index.ts'

export function renderProjectCard(project: Project): string {
  const tags = project.tags
    .map(tag => `<span class="card__tag">${tag}</span>`)
    .join('')

  const links: string[] = []
  if (project.github) {
    links.push(`<a href="${project.github}" target="_blank" rel="noopener" class="card__link">GitHub</a>`)
  }
  if (project.liveUrl) {
    links.push(`<a href="${project.liveUrl}" target="_blank" rel="noopener" class="card__link">Live Demo</a>`)
  }

  const linksHtml = links.length
    ? `<div class="card__links">${links.join('')}</div>`
    : ''

  return `
    <article class="card">
      <h3 class="card__title">${project.title}</h3>
      <p class="card__description">${project.description}</p>
      <div class="card__tags">${tags}</div>
      ${linksHtml}
    </article>
  `
}
