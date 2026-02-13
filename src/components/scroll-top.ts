export function mountScrollTop(): void {
  const btn = document.createElement('button')
  btn.className = 'scroll-top'
  btn.setAttribute('aria-label', 'Scroll to top')
  btn.textContent = '\u2191'
  document.body.appendChild(btn)

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  window.addEventListener('scroll', () => {
    btn.classList.toggle('scroll-top--visible', window.scrollY > 300)
  }, { passive: true })
}
