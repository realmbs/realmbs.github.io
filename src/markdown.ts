import { marked } from 'marked'
import type { WriteupMeta, Writeup } from './types/index.ts'

const modules = import.meta.glob('./content/writeups/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

interface FrontmatterResult {
  data: Record<string, unknown>
  content: string
}

function parseFrontmatter(raw: string): FrontmatterResult {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }

  const data: Record<string, unknown> = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value: unknown = line.slice(idx + 1).trim()
    // Remove surrounding quotes
    if (typeof value === 'string' && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    // Parse YAML arrays like ["a", "b"]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value
        .slice(1, -1)
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
    }
    data[key] = value
  }

  return { data, content: match[2] }
}

function buildWriteups(): Writeup[] {
  const writeups: Writeup[] = []

  for (const [path, raw] of Object.entries(modules)) {
    const slug = path.split('/').pop()!.replace(/\.md$/, '')
    const { data, content } = parseFrontmatter(raw)
    const html = marked.parse(content) as string

    writeups.push({
      slug,
      title: (data.title as string) ?? slug,
      date: (data.date as string) ?? '',
      tags: (data.tags as string[]) ?? [],
      description: (data.description as string) ?? '',
      difficulty: data.difficulty as string | undefined,
      html,
    })
  }

  return writeups.sort((a, b) => b.date.localeCompare(a.date))
}

const allWriteups = buildWriteups()

export function getWriteups(): WriteupMeta[] {
  return allWriteups.map(({ html: _html, ...meta }) => meta)
}

export function getWriteup(slug: string): Writeup | undefined {
  return allWriteups.find(w => w.slug === slug)
}
