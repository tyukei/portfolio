import { qwikVite } from '@builder.io/qwik/optimizer'
import { qwikCity } from '@builder.io/qwik-city/vite'
import uno from '@unocss/vite'
import { defineConfig, type UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json'

type PkgDep = Record<string, string>
const { dependencies = {}, devDependencies = {} } = pkg as unknown as {
  dependencies: PkgDep
  devDependencies: PkgDep
  [key: string]: unknown
}
errorOnDuplicatesPkgDeps(devDependencies, dependencies)

function normalizeBasePath(value: string | undefined): string {
  if (!value) return '/'
  const withLeading = value.startsWith('/') ? value : `/${value}`
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`
}

function detectPagesBasePath(): string {
  if (process.env.BASE_PATH) {
    return normalizeBasePath(process.env.BASE_PATH)
  }

  // Prefer explicit origin path when provided (works for custom domains too).
  if (process.env.SITE_ORIGIN) {
    try {
      const path = new URL(process.env.SITE_ORIGIN).pathname
      return normalizeBasePath(path || '/')
    } catch {
      // ignore invalid URL and fall through
    }
  }

  if (process.env.GITHUB_ACTIONS === 'true') {
    const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
    if (repo) return normalizeBasePath(repo)
  }

  return '/'
}

export default defineConfig((): UserConfig => {
  const basePath = detectPagesBasePath()
  return {
    base: basePath,
    plugins: [uno(), qwikCity(), qwikVite(), tsconfigPaths()],
    optimizeDeps: {
      exclude: [],
    },
    server: {
      headers: {
        'Cache-Control': 'public, max-age=0',
      },
    },
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  }
})

function errorOnDuplicatesPkgDeps(
  devDependencies: PkgDep,
  dependencies: PkgDep,
) {
  let msg = ''
  const duplicateDeps = Object.keys(devDependencies).filter(
    (dep) => dependencies[dep],
  )

  const qwikPkg = Object.keys(dependencies).filter((value) =>
    /qwik/i.test(value),
  )

  msg = `Move qwik packages ${qwikPkg.join(', ')} to devDependencies`

  if (qwikPkg.length > 0) {
    throw new Error(msg)
  }

  msg = `
    Warning: The dependency "${duplicateDeps.join(', ')}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `

  if (duplicateDeps.length > 0) {
    throw new Error(msg)
  }
}
