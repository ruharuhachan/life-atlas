# Beer Atlas 実店舗データ投入メモ

## 2026-09-09 初回投入

自由が丘の実店舗2件から開始する。

- Tai Kou Rou JIYUGAOKA
  - 住所・営業時間: 店舗公式サイト
  - エクストラコールド提供: 食べログの店舗掲載情報で確認
- とよ田
  - 住所・営業時間: 食べログの現行店舗ページで確認
  - エクストラコールド提供: 食べログのドリンクメニューで確認

### データ方針

- エクストラコールドはメーカー認定ではなく「提供区分」として扱い、`officialCertified` は false とする。
- Google口コミはGoogle由来の取得経路が整うまで score / reviewCount / collectedAt を null とする。食べログ等の点数を代入しない。
- `sources` と `lastVerifiedAt` を必須運用とし、店舗の営業・提供状況は定期的に再確認する。
- 地図座標は案内用。Google Place ID取得済みの店舗は `externalIds.googlePlaceId` に保持し、将来のGoogle連携時の重複防止キーに使う。
- 初期表示は自由が丘に絞り、実店舗が最初から確認できる状態にする。
