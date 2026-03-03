import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik'
import { type ZennArticle, fetchArticles } from '~/lib/articles'

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
        class="py-3 transition-opacity group-hover:opacity-70"
        style={props.last ? '' : 'border-bottom:1px solid var(--border)'}
      >
        <div class="flex items-start gap-3">
          <span class="text-xl flex-shrink-0">{article.emoji}</span>
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
      </div>
    </a>
  )
})

export const Articles = component$(() => {
  const articles = useSignal<ZennArticle[]>([])
  const loading = useSignal(true)

  useVisibleTask$(async () => {
    try {
      articles.value = await fetchArticles(3)
    } catch {
      // silently fail
    } finally {
      loading.value = false
    }
  })

  return (
    <div>
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-2xl font-bold" style="color:var(--text-1)">
          Articles
        </h2>
        <a
          href="https://zenn.dev/kei_ninja"
          target="_blank"
          rel="noopener noreferrer"
          class="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
          style="color:var(--accent)"
        >
          Zenn でみる
          <div class="i-tabler:external-link w-3 h-3" />
        </a>
      </div>

      {loading.value ? (
        <div class="flex items-center gap-2 text-sm py-4" style="color:var(--text-2)">
          <div class="i-tabler:loader-2 w-4 h-4 animate-spin" />
          Loading...
        </div>
      ) : articles.value.length === 0 ? (
        <p class="text-sm" style="color:var(--text-2)">
          記事が見つかりませんでした。
        </p>
      ) : (
        <div>
          {articles.value.map((article, i) => (
            <ArticleCard key={article.url} article={article} last={i === articles.value.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
})
