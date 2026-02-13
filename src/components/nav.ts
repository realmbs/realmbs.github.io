const NAV_LINKS = [
  { label: 'home', href: '#/' },
  { label: 'projects', href: '#/projects' },
  { label: 'skills', href: '#/skills' },
  { label: 'writeups', href: '#/writeups' },
  { label: 'contact', href: '#/contact' },
]

function isActive(href: string): boolean {
  const current = window.location.hash.slice(1) || '/'
  const target = href.slice(1)
  if (target === '/') return current === '/'
  return current.startsWith(target)
}

export function mountNav(): void {
  const header = document.getElementById('site-header')
  if (!header) return

  const links = NAV_LINKS.map(
    (link) =>
      `<a href="${link.href}" class="site-nav__link${isActive(link.href) ? ' site-nav__link--active' : ''}">${link.label}</a>`,
  ).join('')

  header.innerHTML = `
    <nav class="site-nav">
      <a href="#/" class="site-nav__logo">realmbs</a>
      <button class="site-nav__toggle" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </button>
      <div class="site-nav__links">${links}</div>
    </nav>
  `

  const nav = header.querySelector('.site-nav')!
  const toggle = header.querySelector('.site-nav__toggle')!

  toggle.addEventListener('click', () => {
    nav.classList.toggle('site-nav--open')
  })

  header.querySelectorAll('.site-nav__link').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('site-nav--open')
    })
  })
}

export function updateNavActive(): void {
  document.querySelectorAll('.site-nav__link').forEach((el) => {
    const href = el.getAttribute('href') ?? ''
    el.classList.toggle('site-nav__link--active', isActive(href))
  })
}
