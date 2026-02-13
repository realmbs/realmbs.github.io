export function mountFooter(): void {
  const footer = document.getElementById('site-footer')
  if (!footer) return

  const year = new Date().getFullYear()

  footer.innerHTML = `
    <div class="site-footer">
      <div class="site-footer__links">
        <a href="https://github.com/realmbs" target="_blank" rel="noopener">GitHub</a>
        <a href="https://linkedin.com/in/" target="_blank" rel="noopener">LinkedIn</a>
      </div>
      <p>&copy; ${year} realmbs</p>
    </div>
  `
}
