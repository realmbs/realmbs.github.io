import resume from '../data/resume.json'

export function mountFooter(): void {
  const footer = document.getElementById('site-footer')
  if (!footer) return

  const year = new Date().getFullYear()

  footer.innerHTML = `
    <div class="site-footer">
      <div class="site-footer__links">
        <a href="${resume.github}" target="_blank" rel="noopener">GitHub</a>
        <a href="${resume.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
      </div>
      <p>&copy; ${year} ${resume.name}</p>
    </div>
  `
}
