import './styles/main.scss'
import { addRoute, startRouter } from './router.ts'
import { mountNav, updateNavActive } from './components/nav.ts'
import { mountFooter } from './components/footer.ts'
import { render as renderHome } from './pages/home.ts'
import { render as renderProjects } from './pages/projects.ts'
import { render as renderSkills } from './pages/skills.ts'
import { render as renderWriteups } from './pages/writeups.ts'
import { render as renderContact } from './pages/contact.ts'

function getPageContent(): HTMLElement {
  return document.getElementById('page-content')!
}

function pageHandler(renderFn: (el: HTMLElement, params: Record<string, string>) => void) {
  return (params: Record<string, string>) => {
    renderFn(getPageContent(), params)
    updateNavActive()
    window.scrollTo(0, 0)
  }
}

addRoute('/', pageHandler(renderHome))
addRoute('/projects', pageHandler(renderProjects))
addRoute('/skills', pageHandler(renderSkills))
addRoute('/writeups', pageHandler(renderWriteups))
addRoute('/contact', pageHandler(renderContact))

mountNav()
mountFooter()
startRouter()
