#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI が見つかりません。先にインストールしてください。"
  exit 1
fi

# シェルの GITHUB_TOKEN/GH_TOKEN が gh の保存済み認証を上書きしないようにする
gh_cmd() {
  env -u GITHUB_TOKEN -u GH_TOKEN -u GITHUB_ENTERPRISE_TOKEN -u GH_ENTERPRISE_TOKEN gh "$@"
}

if ! gh_cmd api user >/dev/null 2>&1; then
  echo "Error: gh の認証を確認できません。"
  echo "次を実行後に再実行してください: env -u GITHUB_TOKEN gh auth login"
  exit 1
fi

if [[ -f ".env" ]]; then
  # .env の値を使いたい場合の補助（未定義なら無視）
  # shellcheck disable=SC1091
  set -a && source ./.env && set +a
fi

echo "GitHub Actions Secrets を設定します:"
echo "- PORTFOLIO_TOKEN_TYUKEI"
echo "- PORTFOLIO_TOKEN_CHUKEI2"
echo ""

read -r -s -p "Token for tyukei (空なら .env の PORTFOLIO_TOKEN_TYUKEI / GITHUB_TOKEN_TYUKEI を使用): " input_tyukei
echo ""
read -r -s -p "Token for chukei2 (空なら .env の PORTFOLIO_TOKEN_CHUKEI2 / GITHUB_TOKEN_CHUKEI2 を使用): " input_chukei2
echo ""

token_tyukei="${input_tyukei:-${PORTFOLIO_TOKEN_TYUKEI:-${GITHUB_TOKEN_TYUKEI:-}}}"
token_chukei2="${input_chukei2:-${PORTFOLIO_TOKEN_CHUKEI2:-${GITHUB_TOKEN_CHUKEI2:-}}}"

if [[ -z "${token_tyukei}" || -z "${token_chukei2}" ]]; then
  echo "Error: 2つのトークンが必要です。入力するか .env に設定してください。"
  exit 1
fi

gh_cmd secret set PORTFOLIO_TOKEN_TYUKEI -b "${token_tyukei}"
gh_cmd secret set PORTFOLIO_TOKEN_CHUKEI2 -b "${token_chukei2}"

echo "Done."
gh_cmd secret list | grep -E 'PORTFOLIO_TOKEN_TYUKEI|PORTFOLIO_TOKEN_CHUKEI2' || true
