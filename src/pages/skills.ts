import type { SkillCategory } from '../types/index.ts'
import skills from '../data/skills.json'

export function render(container: HTMLElement, _params: Record<string, string>): void {
  const sections = (skills as SkillCategory[]).map(category => `
    <div class="skills-section">
      <h2 class="skills-section__title">${category.name}</h2>
      <div class="skills-section__list">
        ${category.items.map(item => `<span class="skills-section__item">${item}</span>`).join('')}
      </div>
    </div>
  `).join('')

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Skills</h1>
      <p class="page-header__subtitle">Technical skills and certifications.</p>
    </div>
    ${sections}
  `
}
