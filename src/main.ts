import './styles/main.scss'
import { addRoute, startRouter } from './router.ts'
import { mountNav, updateNavActive } from './components/nav.ts'
import { mountFooter } from './components/footer.ts'
import { render as renderHome } from './pages/home.ts'
import { render as renderProjects } from './pages/projects.ts'
import { render as renderSkills } from './pages/skills.ts'
import { render as renderWriteups } from './pages/writeups.ts'
import { render as renderContact } from './pages/contact.ts'
import { render as renderWriteupDetail } from './pages/writeup-detail.ts'

function getPageContent(): HTMLElement {
  return document.getElementById('page-content')!
}

function setTitle(page?: string): void {
  document.title = page ? `${page} | Mark Blaha` : 'Mark Blaha'
}

function pageHandler(title: string, renderFn: (el: HTMLElement, params: Record<string, string>) => void) {
  return (params: Record<string, string>) => {
    renderFn(getPageContent(), params)
    setTitle(title || undefined)
    updateNavActive()
    window.scrollTo(0, 0)
  }
}

addRoute('/', pageHandler('', renderHome))
addRoute('/projects', pageHandler('Projects', renderProjects))
addRoute('/skills', pageHandler('Skills', renderSkills))
addRoute('/writeups', pageHandler('Writeups', renderWriteups))
addRoute('/writeups/:slug', pageHandler('Writeup', renderWriteupDetail))
addRoute('/contact', pageHandler('Contact', renderContact))

mountNav()
mountFooter()
startRouter()
