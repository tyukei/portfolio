# Keita Nakata Portfolio

沖縄のデータエンジニア @tyukei のポートフォリオサイトです。
「Activity-First」をコンセプトに、GitHub・Zenn・Connpass・SpeakerDeck での活動記録を中心に、スキルや登壇資料、記事などをシンプルにまとめています。

- **URL**: [https://tyukei.com](https://tyukei.com)

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

Qwikのローカルサーバーを起動します。  
`/api/*` は Qwik City の TypeScript エンドポイントとして同時に起動するため、PHPサーバーは不要です。

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

#### 独自ドメイン (`tyukei.com`) の適用

GitHub Pages に独自ドメインを適用する手順です。

1. **Pages設定画面**: GitHub側の **Settings > Pages** 内にある「Custom domain」項目に `tyukei.com` を入力して保存します。
2. **DNSレコードの設定**: ご利用のドメイン管理サービス（例: お名前.com, ムームードメイン等）の DNS 設定画面で、以下のどちらか（または両方）のレコードを追加してください。
   - **Apexドメイン（tyukei.com そのまま扱う場合）**: GitHub PagesのIPアドレス（`185.199.108.153` など公式が指定するもの）へ `Aレコード` を向ける。
   - **サブドメイン（www.tyukei.com 等）**: `tyukei.github.io` へ `CNAMEレコード` を向ける。

## 📄 License

MIT License
