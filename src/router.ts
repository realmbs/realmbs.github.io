import type { RouteHandler } from './types/index.ts'

interface Route {
  pattern: RegExp
  paramNames: string[]
  handler: RouteHandler
}

const routes: Route[] = []
let notFoundHandler: RouteHandler = () => {
  const el = document.getElementById('page-content')
  if (el) el.innerHTML = '<h1>404 — Not Found</h1>'
}

function pathToRegex(path: string): { pattern: RegExp; paramNames: string[] } {
  const paramNames: string[] = []
  const regexStr = path.replace(/:([^/]+)/g, (_match, paramName: string) => {
    paramNames.push(paramName)
    return '([^/]+)'
  })
  return { pattern: new RegExp(`^${regexStr}$`), paramNames }
}

export function addRoute(path: string, handler: RouteHandler): void {
  const { pattern, paramNames } = pathToRegex(path)
  routes.push({ pattern, paramNames, handler })
}

export function setNotFound(handler: RouteHandler): void {
  notFoundHandler = handler
}

export function navigateTo(path: string): void {
  window.location.hash = path
}

function resolve(): void {
  const hash = window.location.hash.slice(1) || '/'

  for (const route of routes) {
    const match = hash.match(route.pattern)
    if (match) {
      const params: Record<string, string> = {}
      route.paramNames.forEach((name, i) => {
        params[name] = match[i + 1]
      })
      route.handler(params)
      return
    }
  }

  notFoundHandler({})
}

export function startRouter(): void {
  window.addEventListener('hashchange', resolve)
  resolve()
}
