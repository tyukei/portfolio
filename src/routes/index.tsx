import { component$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import { Contact } from './Contact'
import { ContentCarousel } from './ContentCarousel'
import { ContributionSection } from './ContributionSection'
import { ProfileCard } from './ProfileCard'
import { SkillConstellation } from './SkillConstellation'

export default component$(() => {
  return (
    <>
      {/* PROFILE (with About inline) */}
      <ProfileCard />

      <section class="max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-12 flex flex-col gap-10">
        {/* Row 1: Carousel — About / Articles / Events / Talks */}
        <ContentCarousel />

        {/* Row 2: 草グラフ — full width */}
        <ContributionSection />

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
