import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { component$ } from '@builder.io/qwik'
import { type DocumentHead, routeLoader$ } from '@builder.io/qwik-city'
import type { ConnpassEvent, Repository, Talk, ZennArticle } from '~/lib/articles'
import type { ContributionData } from '~/lib/contributions'
import { ContentCarousel } from './ContentCarousel'
import { ContributionSection } from './ContributionSection'
import { Marquee } from './Marquee'
import { ProfileCard } from './ProfileCard'
import { SkillConstellation } from './SkillConstellation'

interface StaticPortfolioData {
  articles: ZennArticle[]
  events: ConnpassEvent[]
  talks: Talk[]
  repositories: Repository[]
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

  const [articlesJson, eventsJson, talksJson, repositoriesJson] = await Promise.all([
    readJsonFile<{ articles?: ZennArticle[] }>(join(staticApiDir, 'articles.json')),
    readJsonFile<{ events?: ConnpassEvent[] }>(join(staticApiDir, 'events.json')),
    readJsonFile<{ talks?: Talk[] }>(join(staticApiDir, 'talks.json')),
    readJsonFile<{ repositories?: Repository[] }>(join(staticApiDir, 'repositories.json')),
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
    repositories: repositoriesJson?.repositories ?? [],
    contributionsByYear,
    selectedYear,
  } satisfies StaticPortfolioData
})

export default component$(() => {
  const data = useStaticPortfolioData()

  return (
    <>
      {/* Hero: Profile card with text-reveal */}
      <ProfileCard />

      {/* Marquee ticker below hero */}
      <Marquee />

      {/* Main content — generous vertical spacing for "引き算" feel */}
      <section class="max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-32 flex flex-col gap-24">
        {/* Row 1: Carousel — Articles / Events / Talks / Repositories */}
        <ContentCarousel
          articles={data.value.articles}
          events={data.value.events}
          talks={data.value.talks}
          repositories={data.value.repositories}
        />

        {/* Row 2: Contribution graph */}
        <ContributionSection
          byYear={data.value.contributionsByYear}
          selectedYear={data.value.selectedYear}
        />

        {/* Row 3: Skills constellation */}
        <SkillConstellation />
      </section>
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
