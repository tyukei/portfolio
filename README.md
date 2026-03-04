# Keita Nakata Portfolio

沖縄のデータエンジニア @tyukei のポートフォリオサイトです。
「Activity-First」をコンセプトに、GitHub・Zenn・Connpass・SpeakerDeck での活動記録を中心に、スキルや登壇資料、記事などをシンプルにまとめています。

- **URL**: [https://tyukei.github.io/portfolio/](https://tyukei.github.io/portfolio/)

## 🛠 Tech Stack

- **Framework**: [Qwik](https://qwik.dev/)
- **Styling**: [UnoCSS](https://unocss.dev/) / Tailwind CSS utility classes
- **Hosting**: GitHub Pages (Static Hosting)

## 🚀 Setup & Development

### 1. Prerequisites

- Node.js (v20+)
- npm または yarn

### 2. Installation

リポジトリをクローン後、依存パッケージをインストールします。

```bash
git clone https://github.com/tyukei/portfolio.git
cd portfolio
npm install
```

### 3. Development Server

Qwik のローカルサーバーを起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いて確認できます。

### 4. Build & Deploy (GitHub Pages)

このプロジェクトはサーバーバックエンド（PHP等）に依存せず、静的ファイルのみで完全に動作します。

本番環境向けにビルドするには、以下のコマンドを実行します。

```bash
# クライアント環境（静的）とサーバー環境を合わせてビルド
npm run build
```

静的ファイルとして `dist/` ディレクトリにすべてのファイルが出力されます。これをそのまま GitHub Pages で公開可能です。

#### GitHub Pages での公開手順

1. GitHub リポジトリの仕様に従い、この `dist/` ディレクトリ配下（もしくはビルド出力結果）を `gh-pages` ブランチなどで配信する構成、もしくは GitHub Actions を活用して公開します。
2. GitHubリポジトリの **Settings > Pages** を開き、「Source」をビルドが出力されるブランチ（例: `gh-pages`）または自動デプロイされる `GitHub Actions` に設定します。

## 📄 License

MIT License
