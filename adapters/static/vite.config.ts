import { staticAdapter } from '@builder.io/qwik-city/adapters/static/vite'
import { extendConfig } from '@builder.io/qwik-city/vite'
import baseConfig from '../../vite.config'

export default extendConfig(baseConfig, () => {
  const siteOrigin = process.env.SITE_ORIGIN || 'https://tyukei.github.io/portfolio'
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ['@qwik-city-plan'],
      },
    },
    plugins: [
      staticAdapter({
        origin: siteOrigin,
      }),
    ],
  }
})
