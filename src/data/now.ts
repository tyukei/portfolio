export interface NowItem {
  emoji: string
  label: string
  detail: string
}

export interface NowSection {
  title: string
  items: NowItem[]
}

export const NOW_UPDATED = '2026-03-03'

export const NOW_DATA: NowSection[] = [
  {
    title: '今取り組んでいること',
    items: [
      {
        emoji: '🤖',
        label: 'LLM Agent 開発',
        detail:
          'MCP (Model Context Protocol) を活用したデータエンジニアリング自動化ツールを開発中。BigQuery との連携でクエリ最適化を自動提案するエージェントを構築している。',
      },
      {
        emoji: '📊',
        label: 'データパイプライン刷新',
        detail:
          '社内のバッチ処理を Cloud Run Jobs + BigQuery に移行中。dbt でのデータ変換レイヤーを整備し、データ品質チェックを自動化している。',
      },
      {
        emoji: '🌐',
        label: 'ポートフォリオリニューアル',
        detail:
          'Qwik + UnoCSS で Activity-First なポートフォリオを構築。草グラフをファーストビューに据えた設計で、「何をやってきたか」を一目で伝えることを目指している。',
      },
    ],
  },
  {
    title: '読んでいるもの',
    items: [
      {
        emoji: '📖',
        label: 'Designing Data-Intensive Applications',
        detail:
          'Martin Kleppmann の名著。分散システムとデータ一貫性の章を重点的に読み直している。',
      },
      {
        emoji: '📰',
        label: 'Google Cloud Blog',
        detail:
          'BigQuery や Vertex AI の新機能を追っている。特に BigQuery ML の動向が気になっている。',
      },
    ],
  },
  {
    title: '最近ハマっていること',
    items: [
      {
        emoji: '🏄',
        label: 'SUP (スタンドアップパドル)',
        detail:
          '沖縄の海で週末に SUP を楽しんでいる。透明度が高い慶良間の海は最高。',
      },
      {
        emoji: '☕',
        label: 'コーヒー自家焙煎',
        detail:
          'ハンドピックから焙煎まで自分でやるようになった。エチオピア産のナチュラルプロセスが今のお気に入り。',
      },
    ],
  },
  {
    title: '最近参加したイベント・勉強会',
    items: [
      {
        emoji: '🎤',
        label: 'Okinawa.rb',
        detail:
          '沖縄の Ruby コミュニティで LLM × Ruby の話をした。思ったより反響が大きくて嬉しかった。',
      },
      {
        emoji: '💻',
        label: 'DevelopersIO',
        detail:
          'クラスメソッドさんの技術ブログを参考に GCP コスト最適化のネタを仕込み中。',
      },
    ],
  },
]

// English fallback — mirrors NOW_DATA. Used when now-en.json hasn't been generated yet.
export const NOW_DATA_EN: NowSection[] = [
  {
    title: "What I'm working on now",
    items: [
      {
        emoji: '🤖',
        label: 'Building LLM Agents',
        detail:
          'Building data-engineering automation tools on top of MCP (Model Context Protocol). Currently working on an agent that auto-suggests query optimizations through BigQuery integration.',
      },
      {
        emoji: '📊',
        label: 'Rebuilding data pipelines',
        detail:
          'Migrating in-house batch jobs to Cloud Run Jobs + BigQuery. Setting up a dbt transformation layer and automating data-quality checks.',
      },
      {
        emoji: '🌐',
        label: 'Portfolio renewal',
        detail:
          'Building an activity-first portfolio with Qwik + UnoCSS. The contribution graph sits in the first view to convey "what I have done" at a glance.',
      },
    ],
  },
  {
    title: "What I'm reading",
    items: [
      {
        emoji: '📖',
        label: 'Designing Data-Intensive Applications',
        detail:
          "Martin Kleppmann's classic. Re-reading the chapters on distributed systems and data consistency in particular.",
      },
      {
        emoji: '📰',
        label: 'Google Cloud Blog',
        detail:
          'Keeping up with new BigQuery and Vertex AI features. Especially curious about where BigQuery ML is heading.',
      },
    ],
  },
  {
    title: "What I'm into lately",
    items: [
      {
        emoji: '🏄',
        label: 'SUP (stand-up paddleboarding)',
        detail:
          'Enjoying SUP on the Okinawa sea on weekends. The crystal-clear water around the Kerama Islands is the best.',
      },
      {
        emoji: '☕',
        label: 'Home coffee roasting',
        detail:
          'Started doing everything myself from hand-picking to roasting. Ethiopian natural-process beans are my current favorite.',
      },
    ],
  },
  {
    title: 'Recent events & meetups',
    items: [
      {
        emoji: '🎤',
        label: 'Okinawa.rb',
        detail:
          'Gave a talk on LLM × Ruby at the Okinawa Ruby community. The response was bigger than expected, which made me happy.',
      },
      {
        emoji: '💻',
        label: 'DevelopersIO',
        detail:
          "Prepping a GCP cost-optimization topic, drawing on Classmethod's tech blog.",
      },
    ],
  },
]
