import { component$ } from '@builder.io/qwik'
import type { Repository } from '~/lib/articles'

const RepoCard = component$<{ repo: Repository; last: boolean }>((props) => {
  const { repo } = props
  const pushed = repo.pushed_at
    ? new Date(repo.pushed_at).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : ''

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      class="block group"
    >
      <div
        class="py-3 transition-opacity group-hover:opacity-70"
        style={props.last ? '' : 'border-bottom:1px solid var(--border)'}
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="text-sm font-medium leading-snug" style="color:var(--text-1)">
              {repo.full_name}
            </div>
            {repo.description && (
              <div class="text-xs mt-1 leading-relaxed" style="color:var(--text-2)">
                {repo.description}
              </div>
            )}
          </div>
          <div
            class="px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap"
            style="background:var(--bg-surface);color:var(--text-2);border:1px solid var(--border)"
          >
            {repo.owner}
          </div>
        </div>
        <div class="flex items-center gap-3 mt-2 text-xs" style="color:var(--text-2)">
          {repo.language && <span>{repo.language}</span>}
          <span class="flex items-center gap-1">
            <span>★</span>
            <span>{repo.stargazers_count}</span>
          </span>
          <span class="flex items-center gap-1">
            <span>⑂</span>
            <span>{repo.forks_count}</span>
          </span>
          {pushed && <span>更新: {pushed}</span>}
        </div>
      </div>
    </a>
  )
})

export const Repositories = component$<{ repositories: Repository[] }>((props) => {
  const repositories = props.repositories.slice(0, 3)
  return (
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold" style="color:var(--text-1)">
          Repositories
        </h2>
        <a
          href="https://github.com/tyukei?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
          style="color:var(--accent)"
        >
          GitHub でみる
          <div class="i-tabler:external-link w-3 h-3" />
        </a>
      </div>

      {repositories.length === 0 ? (
        <p class="text-sm" style="color:var(--text-2)">
          リポジトリが見つかりませんでした。
        </p>
      ) : (
        <div>
          {repositories.map((repo, i) => (
            <RepoCard key={repo.full_name} repo={repo} last={i === repositories.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
})
