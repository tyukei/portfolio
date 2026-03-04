#!/bin/bash

# .env ファイルが存在するかチェック
if [ ! -f ".env" ]; then
    echo "エラー: .env が見つかりません。"
    exit 1
fi

echo "🚀 GitHub Secrets に変数を登録します..."

# 1. 既存の .env (GITHUB_TOKEN) を登録
echo "🔑 GITHUB_TOKEN を登録中..."
gh secret set -f .env

# 2. FTP情報の入力プロンプトと変数の登録
echo ""
echo "FTP情報を入力してください。"
read -p "FTP_SERVER (例: ftp.lolipop.jp): " ftp_server
gh secret set FTP_SERVER -b "$ftp_server"

read -p "FTP_USERNAME (例: lolipop.jp-xxxxxx): " ftp_username
gh secret set FTP_USERNAME -b "$ftp_username"

read -s -p "FTP_PASSWORD: " ftp_password
echo ""
gh secret set FTP_PASSWORD -b "$ftp_password"

echo "✅ シークレットの登録が完了しました！"
echo "（以下のコマンドで現在登録されているシークレット一覧を確認できます: gh secret list）"
