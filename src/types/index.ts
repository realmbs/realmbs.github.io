export type RouteHandler = (params: Record<string, string>) => void

export interface Project {
  slug: string
  title: string
  description: string
  tags: string[]
  github?: string
  liveUrl?: string
  image?: string
  pdf?: string
}

export interface SkillCategory {
  name: string
  items: string[]
}

export interface WriteupMeta {
  slug: string
  title: string
  date: string
  tags: string[]
  description: string
  difficulty?: string
}

export interface Writeup extends WriteupMeta {
  html: string
}
