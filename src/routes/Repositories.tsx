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
        class="py-4 px-3 -mx-3 rounded-lg transition-colors duration-200 group-hover:bg-[var(--bg-surface)]"
        style={props.last ? '' : 'border-bottom:1px solid var(--border)'}
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <div class="flex items-start gap-2 flex-wrap">
              <div class="text-sm font-medium leading-snug" style="color:var(--text-1)">
                {repo.full_name}
              </div>
              <div
                class="px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap"
                style="background:var(--bg-card);color:var(--text-2);border:1px solid var(--border)"
              >
                {repo.owner}
              </div>
            </div>
            {repo.description && (
              <div class="text-xs mt-1 leading-relaxed" style="color:var(--text-2)">
                {repo.description}
              </div>
            )}
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
          {/* Arrow slides right on hover */}
          <span
            class="flex-shrink-0 text-base transition-transform duration-300 ease-out group-hover:translate-x-1 mt-0.5"
            style="color:var(--text-2)"
          >
            →
          </span>
        </div>
      </div>
    </a>
  )
})

export const Repositories = component$<{ repositories: Repository[] }>((props) => {
  const repositories = props.repositories.slice(0, 3)
  return (
    <div>
      <div class="flex items-center justify-between mb-4">
        {/* Serif heading with vertical writing accent */}
        <div class="flex items-start gap-2">
          <h2 class="font-serif-jp text-2xl font-bold" style="color:var(--text-1)">
            Repositories
          </h2>
          <span
            class="text-[9px] tracking-widest mt-1 select-none"
            style="writing-mode:vertical-rl;text-orientation:mixed;color:var(--text-2);opacity:0.4;letter-spacing:0.2em"
          >
            リポジトリ
          </span>
        </div>
        <a
          href="https://github.com/tyukei?tab=repositories"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs flex items-center gap-1 tracking-wider uppercase transition-opacity hover:opacity-40"
          style="color:var(--text-2);letter-spacing:0.12em"
        >
          GitHub
          <div class="i-tabler:arrow-up-right w-3 h-3" />
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
