import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { component$ } from '@builder.io/qwik'
import { type DocumentHead, routeLoader$ } from '@builder.io/qwik-city'
import type { ConnpassEvent, Talk, ZennArticle } from '~/lib/articles'
import type { ContributionData } from '~/lib/contributions'
import { Contact } from './Contact'
import { ContentCarousel } from './ContentCarousel'
import { ContributionSection } from './ContributionSection'
import { ProfileCard } from './ProfileCard'
import { SkillConstellation } from './SkillConstellation'

interface StaticPortfolioData {
  articles: ZennArticle[]
  events: ConnpassEvent[]
  talks: Talk[]
  contributionsByYear: Record<number, ContributionData>
  selectedYear: number
}

const EMPTY_CONTRIBUTION: ContributionData = {
  contributions: {},
  summary: {
    github: 0,
    zenn: 0,
    connpass: 0,
    speakerdeck: 0,
  },
}

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from(
  { length: CURRENT_YEAR - 2020 + 1 },
  (_, i) => CURRENT_YEAR - i,
)

async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, 'utf-8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export const useStaticPortfolioData = routeLoader$(async ({ url }) => {
  const root = process.cwd()
  const staticApiDir = join(root, 'public', 'static-api')
  const yearRaw = Number.parseInt(url.searchParams.get('year') ?? '', 10)
  const selectedYear =
    Number.isFinite(yearRaw) && yearRaw >= 2020 && yearRaw <= CURRENT_YEAR
      ? yearRaw
      : CURRENT_YEAR

  const [articlesJson, eventsJson, talksJson] = await Promise.all([
    readJsonFile<{ articles?: ZennArticle[] }>(join(staticApiDir, 'articles.json')),
    readJsonFile<{ events?: ConnpassEvent[] }>(join(staticApiDir, 'events.json')),
    readJsonFile<{ talks?: Talk[] }>(join(staticApiDir, 'talks.json')),
  ])

  const contributionsByYear: Record<number, ContributionData> = {}
  await Promise.all(
    YEARS.map(async (year) => {
      const json = await readJsonFile<ContributionData>(
        join(staticApiDir, 'heatmap', `${year}.json`),
      )
      contributionsByYear[year] = json ?? EMPTY_CONTRIBUTION
    }),
  )

  return {
    articles: articlesJson?.articles ?? [],
    events: eventsJson?.events ?? [],
    talks: talksJson?.talks ?? [],
    contributionsByYear,
    selectedYear,
  } satisfies StaticPortfolioData
})

export default component$(() => {
  const data = useStaticPortfolioData()

  return (
    <>
      {/* PROFILE (with About inline) */}
      <ProfileCard />

      <section class="max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-12 flex flex-col gap-10">
        {/* Row 1: Carousel — About / Articles / Events / Talks */}
        <ContentCarousel
          articles={data.value.articles}
          events={data.value.events}
          talks={data.value.talks}
        />

        {/* Row 2: 草グラフ — full width */}
        <ContributionSection
          byYear={data.value.contributionsByYear}
          selectedYear={data.value.selectedYear}
        />

        {/* Row 3: Skills */}
        <SkillConstellation />
      </section>

      {/* CONTACT */}
      <Contact />
    </>
  )
})

export const head: DocumentHead = {
  title: 'Keita Nakata / tyukei',
  meta: [
    {
      name: 'description',
      content:
        '沖縄のデータエンジニア。Activity-First なポートフォリオ。GitHub・Zenn・Connpass・SpeakerDeck の活動グラフをファーストビューに。',
    },
    {
      property: 'og:title',
      content: 'Keita Nakata / tyukei',
    },
    {
      property: 'og:description',
      content: '沖縄のデータエンジニア。Activity-First portfolio.',
    },
    {
      name: 'twitter:card',
      content: 'summary',
    },
  ],
}
