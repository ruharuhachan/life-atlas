# Life Atlas

暮らす場所を、感覚だけで決めないための地域生活メディアです。

最初の対象地域は新潟。住まい、食、仕事、支援制度、移動、走る場所を、出典と確認日を添えて整理します。

## 開発

1. pnpm install
2. pnpm dev
3. pnpm run ci

## 公開

main ブランチへの反映を契機に、GitHub Actions が静的サイトをビルドして GitHub Pages へ公開します。独自ドメインは life-atlas.jp です。

GitHub の Settings → Pages → Source は GitHub Actions を選択してください。

## コンテンツ方針

- 公式情報と運営者の観察を分ける
- 制度、価格、営業時間など変化する情報には確認日を持たせる
- 写真、ロゴ、発言は公開許諾を確認する
- 個人情報、商談情報、秘密情報を公開リポジトリへ置かない
