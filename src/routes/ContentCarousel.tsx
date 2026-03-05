import {
    component$,
    useSignal,
    useStylesScoped$,
    useVisibleTask$,
    $,
} from '@builder.io/qwik'
import type { ConnpassEvent, Repository, Talk, ZennArticle } from '~/lib/articles'
import { Articles } from './Articles'
import { Events } from './Events'
import { Repositories } from './Repositories'
import { Talks } from './Talks'

/**
 * 2 items visible per step (on md: screens).
 *   0 → Articles      | Events
 *   1 → Events        | Talks
 *   2 → Talks         | Repositories
 *   3 → Repositories  | Articles (clone)
 *   4 → Articles (c)  | Events (c)  → snap back to 0
 */
export const ContentCarousel = component$<{
    articles: ZennArticle[]
    events: ConnpassEvent[]
    talks: Talk[]
    repositories: Repository[]
}>((props) => {
    useStylesScoped$(`
    .carousel-track {
      --shift: 100%;
    }
    .carousel-item {
      flex: 0 0 100%;
    }
    @media (min-width: 768px) {
      .carousel-track {
        --shift: 50%;
      }
      .carousel-item {
        flex: 0 0 50%;
      }
    }
    
    .nav-zone {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 15%;
      z-index: 10;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .nav-zone:hover {
      opacity: 1;
    }
    .nav-zone.left {
      left: -5%;
      background: linear-gradient(90deg, var(--bg-surface) 0%, transparent 100%);
    }
    .nav-zone.right {
      right: -5%;
      background: linear-gradient(-90deg, var(--bg-surface) 0%, transparent 100%);
    }
    .nav-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  `)

    const step = useSignal(0)
    const animated = useSignal(true)
    const isHovering = useSignal(false)

    const handleNext = $(() => {
        if (step.value >= 4) return
        animated.value = true
        step.value++

        if (step.value === 4) {
            setTimeout(() => {
                if (!animated.value) return // already reset
                animated.value = false
                step.value = 0
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => {
                        animated.value = true
                    })
                )
            }, 650)
        }
    })

    const handlePrev = $(() => {
        if (step.value <= 0) {
            // Snap to end clone, then animate backwards
            animated.value = false
            step.value = 4
            requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                    animated.value = true
                    step.value = 3
                })
            )
            return
        }
        animated.value = true
        step.value--
    })

    useVisibleTask$(({ cleanup }) => {
        const interval = setInterval(() => {
            if (!isHovering.value) {
                handleNext()
            }
        }, 5000)

        cleanup(() => clearInterval(interval))
    })

    return (
        <div
            class="w-full relative"
            onMouseEnter$={() => (isHovering.value = true)}
            onMouseLeave$={() => (isHovering.value = false)}
        >
            {/* Left Nav Zone */}
            <div class="nav-zone left hidden md:flex" onClick$={handlePrev}>
                <div class="nav-icon">
                    <div class="i-tabler:chevron-left w-6 h-6" />
                </div>
            </div>

            <div class="w-full overflow-hidden">
                <div class="-mx-5">
                    <div
                        class="carousel-track"
                        style={`display: flex; flex-wrap: nowrap; transform: translateX(calc(-1 * var(--shift) * ${step.value})); ${animated.value
                                ? 'transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                : 'transition: none'
                            }`}
                    >
                        <div class="carousel-item px-5" key="articles">
                            <Articles articles={props.articles} />
                        </div>
                        <div class="carousel-item px-5" key="events">
                            <Events events={props.events} />
                        </div>
                        <div class="carousel-item px-5" key="talks">
                            <Talks talks={props.talks} />
                        </div>
                        <div class="carousel-item px-5" key="repositories">
                            <Repositories repositories={props.repositories} />
                        </div>
                        <div class="carousel-item px-5" key="articles-c">
                            <Articles articles={props.articles} />
                        </div>
                        <div class="carousel-item px-5" key="events-c">
                            <Events events={props.events} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Nav Zone */}
            <div class="nav-zone right hidden md:flex" onClick$={handleNext}>
                <div class="nav-icon">
                    <div class="i-tabler:chevron-right w-6 h-6" />
                </div>
            </div>
        </div>
    )
})
