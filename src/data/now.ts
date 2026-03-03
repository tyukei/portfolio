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
