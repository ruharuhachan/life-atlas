# Beer Atlas 店舗追加 — GitHub Copilot運用

## 目的

店舗追加のたびにChatGPT等へリポジトリ全体の前提を説明せず、GitHub Copilot cloud agentだけで「入力 → データ追加 → 検証 → PR」まで進めるための運用です。

## 最短運用

1. GitHubの Issues から **Beer Atlas 店舗追加** フォームを開く。
2. 店舗名、住所、Google Maps URL、手動確認したGoogle評価、ビール情報、根拠URL、予約URLを入力してIssueを作る。
3. `github.com/copilot/agents` でこのリポジトリを選択し、カスタムエージェント **Beer Atlas 店舗追加** を選ぶ。
4. プロンプトに `Issue #123 を処理して` のようにIssue番号だけ渡す。
5. Copilotが店舗データを追加し、`pnpm ci` を通してPRを作る。
6. PRの根拠と差分を確認してマージする。
7. `main` へのマージ後は既存のGitHub Pages workflowが自動デプロイする。

## Issueを使わず直接投げる場合

次の形式でカスタムエージェントへ渡しても構いません。

```text
Beer Atlasへ店舗追加

店舗名:
住所:
エリア:
Google Maps URL:
Google口コミ（手動確認）:
メーカー:
提供銘柄・提供方法:
メーカー認定:
根拠URL:
予約URL:
公式サイト:
緯度経度（任意）:
Google Place ID（任意）:
補足:
```

Google口コミは4.0以上を原則の掲載候補基準としますが、その点数はDBへ保存しません。

## Copilotが自動で判断するもの

- 既存店舗との重複
- `manufacturerId`、`brandIds`、`certifications` の既存マスターへのマッピング
- エリアID・neighborhood IDの既存マスターへのマッピング
- 信頼できる予約サービスかどうか
- 未確認項目を `未確認` のまま残すこと
- Google評価値をDBへ保存しないこと
- CI、format、build、test

## 人間が事前に確認するもの

- Google Mapsの口コミ評価（原則4.0以上）
- 店舗が実在していること
- 入力した根拠URLが対象店舗のものか

## 人間がPRで最後に見るもの

- 別店舗を誤登録していないか
- 「提供」と「公式認定」を混同していないか
- 予約リンクが意図したサービスか

## 自動マージについて

現段階では、事実誤認をCIだけで検出できないためPRのマージは人間の確認を残します。コード・データの機械的検証が十分成熟した後に、自動マージを追加する方が安全です。
