import { component$ } from '@builder.io/qwik'
import type { ZennArticle } from '~/lib/articles'

const ArticleCard = component$<{ article: ZennArticle; last: boolean }>((props) => {
  const { article } = props
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : ''

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      class="block group"
    >
      <div
        class="py-4 px-3 -mx-3 rounded-lg min-h-[92px] transition-colors duration-200 group-hover:bg-[var(--bg-surface)]"
        style={props.last ? '' : 'border-bottom:1px solid var(--border)'}
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3 min-w-0">
            <span class="text-xl flex-shrink-0 mt-0.5">{article.emoji}</span>
            <div class="min-w-0">
              <div
                class="text-sm font-medium leading-snug"
                style="color:var(--text-1)"
              >
                {article.title}
              </div>
              <div class="flex items-center gap-3 mt-1 text-xs" style="color:var(--text-2)">
                <span>{date}</span>
                {article.liked_count > 0 && (
                  <span class="flex items-center gap-1">
                    <span>♥</span>
                    <span>{article.liked_count}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Arrow slides right on hover */}
          <span
            class="flex-shrink-0 text-base transition-transform duration-300 ease-out group-hover:translate-x-1"
            style="color:var(--text-2)"
          >
            →
          </span>
        </div>
      </div>
    </a>
  )
})

export const Articles = component$<{ articles: ZennArticle[] }>((props) => {
  const articles = props.articles.slice(0, 3)
  return (
    <div>
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-serif-jp text-2xl font-bold" style="color:var(--text-1)">
            Articles
          </h2>
        </div>
        <a
          href="https://zenn.dev/kei_ninja"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs flex items-center gap-1 tracking-wider uppercase transition-opacity hover:opacity-40"
          style="color:var(--text-2);letter-spacing:0.12em"
        >
          Zenn
          <div class="i-tabler:arrow-up-right w-3 h-3" />
        </a>
      </div>

      {articles.length === 0 ? (
        <p class="text-sm" style="color:var(--text-2)">
          記事が見つかりませんでした。
        </p>
      ) : (
        <div>
          {articles.map((article, i) => (
            <ArticleCard key={article.url} article={article} last={i === articles.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
})
