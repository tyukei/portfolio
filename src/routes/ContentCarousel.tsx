import {
    component$,
    useSignal,
    useStylesScoped$,
    useVisibleTask$,
    $,
} from '@builder.io/qwik'
import { About } from './About'
import { Articles } from './Articles'
import { Events } from './Events'
import { Talks } from './Talks'

/**
 * 2 items visible per step (on md: screens).
 *   0 → About     | Articles
 *   1 → Articles  | Events
 *   2 → Events    | Talks
 *   3 → Talks     | About (clone)
 *   4 → About (c) | Articles (c)  → snap back to 0
 */
export const ContentCarousel = component$(() => {
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

    const PANELS = [
        { key: 'about', component: About },
        { key: 'articles', component: Articles },
        { key: 'events', component: Events },
        { key: 'talks', component: Talks },
        { key: 'about-c', component: About },       // clone 1
        { key: 'articles-c', component: Articles }, // clone 2
    ]

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
                        {PANELS.map((P) => (
                            <div key={P.key} class="carousel-item px-5">
                                <P.component />
                            </div>
                        ))}
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
