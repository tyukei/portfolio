# Keita Nakata Portfolio

沖縄のデータエンジニア @tyukei のポートフォリオサイトです。
「Activity-First」をコンセプトに、GitHub・Zenn・Connpass・SpeakerDeck での活動記録を中心に、スキルや登壇資料、記事などをシンプルにまとめています。

- **URL**: [https://tyukei.com](https://tyukei.com)
  ※実際の公開URLをご記入ください。

## 🛠 Tech Stack

- **Framework**: [Qwik](https://qwik.dev/)
- **Styling**: [UnoCSS](https://unocss.dev/) / Tailwind CSS utility classes
- **Hosting**: Lolipop (Deployed via GitHub Actions)
- **API**: PHP (Data aggregation for GitHub, Zenn, Connpass, SpeakerDeck)

## 🚀 Setup & Development

### 1. Prerequisites

- Node.js (v20+)
- npmまたはyarn

### 2. Installation

リポジトリをクローン後、依存パッケージをインストールします。

```bash
git clone https://github.com/tyukei/portfolio.git
cd portfolio
npm install
```

### 3. Environment Variables (API用)

GitHubのプライベートコミットを含めた草情報を取得するため、`/api` ディレクトリ内に `.env` ファイルを作成する必要があります。

```bash
# api/.env を作成し、以下を記述
GITHUB_TOKEN=ghp_YOUR_PERSONAL_ACCESS_TOKEN
```

### 4. Development Server

Qwikのローカルサーバーを起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いて確認できます。

### 5. Build & Deploy

静的ファイル（SSG）とAPIスクリプトのビルドを実行します。

```bash
npm run build
```

`dist/` ディレクトリに本番用ファイルが出力されます。

本プロジェクトは GitHub Actions によるCI/CDに対応しており、`main` ブランチにプッシュされると自動的に Lolipop サーバーの指定ディレクトリへデプロイされます。

### 6. GitHub Actions Secrets Setup (自動デプロイ設定用)

自動デプロイを有効にするには、GitHub側にFTPパスワードとAPIのトークンを登録する必要があります。
プロジェクトルートに含まれている専用スクリプトを使うと簡単に登録できます。

```bash
# 実行権限を付与してセットアップ用スクリプトを実行
chmod +x setup_secrets.sh
./setup_secrets.sh
```

実行後、画面の指示に従ってFTPサーバー名、アカウント、パスワードを入力すると、自動でリポジトリにSecretが設定されます。（※実行には事前に [GitHub CLI](https://cli.github.com/) がインストールおよびログインされている必要があります）

## 📄 License

MIT License
