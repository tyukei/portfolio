import type { RequestHandler } from '@builder.io/qwik-city'
import {
  fetchText,
  parseSpeakerDeckAtom,
  readJsonCache,
  type SpeakerDeckTalk,
  writeJsonCache,
} from '~/utils/api-utils'

const USERNAME = 'tyukei'

export const onGet: RequestHandler = async ({ json }) => {
  const cacheKey = `talks_${todayKey()}.json`

  const cached = await readJsonCache<SpeakerDeckTalk[]>(cacheKey)
  if (cached) {
    json(200, { talks: cached })
    return
  }

  const xml = await fetchText(`https://speakerdeck.com/${USERNAME}.atom`, {
    headers: {
      'User-Agent': 'portfolio-site/1.0',
    },
  })

  const talks = xml ? parseSpeakerDeckAtom(xml) : []
  await writeJsonCache(cacheKey, talks)
  json(200, { talks })
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}
