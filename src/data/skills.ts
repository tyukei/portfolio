export interface Star {
  name: string
  x: number // 0..1 relative position
  y: number // 0..1 relative position
  level: number // 1..5
}

export interface Constellation {
  name: string
  color: string
  stars: Star[]
  lines: [number, number][] // pairs of star indices
}

export const CONSTELLATIONS: Constellation[] = [
  {
    name: 'Data',
    color: '#22d3ee',
    stars: [
      { name: 'Python', x: 0.18, y: 0.25, level: 5 },
      { name: 'BigQuery', x: 0.28, y: 0.42, level: 4 },
      { name: 'Pandas', x: 0.12, y: 0.48, level: 4 },
      { name: 'SQL', x: 0.22, y: 0.62, level: 4 },
      { name: 'dbt', x: 0.32, y: 0.58, level: 3 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [3, 4],
    ],
  },
  {
    name: 'AI / LLM',
    color: '#a78bfa',
    stars: [
      { name: 'LLM Agent', x: 0.52, y: 0.18, level: 4 },
      { name: 'PyTorch', x: 0.63, y: 0.28, level: 3 },
      { name: 'MCP', x: 0.57, y: 0.38, level: 3 },
      { name: 'Prompt Eng.', x: 0.45, y: 0.32, level: 4 },
    ],
    lines: [
      [0, 1],
      [0, 3],
      [0, 2],
      [2, 1],
    ],
  },
  {
    name: 'Frontend',
    color: '#34d399',
    stars: [
      { name: 'TypeScript', x: 0.78, y: 0.15, level: 4 },
      { name: 'Qwik', x: 0.88, y: 0.28, level: 3 },
      { name: 'React', x: 0.82, y: 0.42, level: 3 },
      { name: 'UnoCSS', x: 0.72, y: 0.35, level: 3 },
    ],
    lines: [
      [0, 1],
      [0, 3],
      [1, 2],
      [2, 3],
    ],
  },
  {
    name: 'Cloud',
    color: '#f59e0b',
    stars: [
      { name: 'GCP', x: 0.72, y: 0.62, level: 4 },
      { name: 'Cloud Run', x: 0.82, y: 0.72, level: 3 },
      { name: 'Terraform', x: 0.65, y: 0.75, level: 2 },
      { name: 'Cloud Storage', x: 0.88, y: 0.58, level: 3 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
    ],
  },
  {
    name: 'Backend',
    color: '#60a5fa',
    stars: [
      { name: 'FastAPI', x: 0.35, y: 0.78, level: 4 },
      { name: 'Node.js', x: 0.48, y: 0.72, level: 3 },
      { name: 'PostgreSQL', x: 0.28, y: 0.88, level: 3 },
      { name: 'Redis', x: 0.42, y: 0.88, level: 2 },
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ],
  },
  {
    name: 'DevOps',
    color: '#fb7185',
    stars: [
      { name: 'Docker', x: 0.58, y: 0.62, level: 4 },
      { name: 'GitHub Actions', x: 0.68, y: 0.52, level: 3 },
      { name: 'Linux', x: 0.52, y: 0.75, level: 3 },
    ],
    lines: [
      [0, 1],
      [0, 2],
    ],
  },
]
