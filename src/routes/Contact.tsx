import { component$ } from '@builder.io/qwik'

export const Contact = component$(() => {
  return (
    <section class="py-24 px-6 md:px-12" style="border-top:1px solid var(--border)">
      <div class="max-w-3xl mx-auto">
        <h2 class="font-serif-jp text-2xl font-bold mb-3" style="color:var(--text-1)">
          お問い合わせフォーム
        </h2>
        <p class="text-sm mb-6" style="color:var(--text-2)">
          ご依頼・ご相談・登壇オファーなどお気軽にどうぞ。
        </p>

        <div class="w-full rounded-xl overflow-hidden" style="border:1px solid var(--border)">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSfdEG1xBEndfKyPQhqGUvHq0tv_lUWj7CNU-DRn7Fi-OJk9rQ/viewform?embedded=true"
            width="100%"
            height="820"
            style="display:block;border:none;color-scheme:light"
            title="お問い合わせフォーム"
            loading="lazy"
          />
        </div>

        <p class="text-xs mt-3" style="color:var(--text-2);opacity:0.5">
          フォームが表示されない場合は{' '}
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSfdEG1xBEndfKyPQhqGUvHq0tv_lUWj7CNU-DRn7Fi-OJk9rQ/viewform"
            target="_blank"
            rel="noopener noreferrer"
            class="underline underline-offset-4 transition-opacity hover:opacity-40"
            style="color:var(--text-1)"
          >
            こちら
          </a>
          {' '}から直接開けます。
        </p>
      </div>
    </section>
  )
})
