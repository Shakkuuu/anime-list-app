# 🧲 Shakkuのアニメリスト

Annictで記録した視聴済みアニメ・視聴中アニメの一覧を表示し、独自の評価を追加したWebアプリケーション。

## 機能

- 📺 Annictから視聴済み・視聴中アニメを取得
- ⭐ **評価システム**
  - ❤️ めちゃ好き
  - ⭐ おすすめ

## 技術スタック

- **フロントエンド**: React + TypeScript + Vite
- **スタイリング**: styled-components
- **状態管理**: Zustand
- **ルーティング**: react-router-dom
- **バックエンド**: Supabase (Auth, Database)
- **API層**: Vercel Serverless Functions
- **外部API**: Annict REST API

## プロジェクト構造

```text
.
├── api/                    # Vercel Serverless Functions
│   ├── check-admin.ts      # 管理者チェック
│   ├── list.ts             # アニメ一覧取得
│   └── rate.ts             # 評価更新
├── src/
│   ├── components/         # React コンポーネント
│   │   ├── AnimeCard.tsx   # アニメカード
│   │   ├── AnimeFilters.tsx # フィルタ・ソートUI
│   │   └── Layout.tsx      # レイアウト（ヘッダー・フッター）
│   ├── pages/              # ページ
│   │   ├── Home.tsx        # 視聴済みアニメ一覧
│   │   ├── Watching.tsx    # 視聴中アニメ一覧
│   │   ├── Login.tsx       # ログイン
│   │   └── NotAdmin.tsx    # 管理者でない場合のページ
│   ├── hooks/              # カスタムフック
│   │   └── useAnimeFilters.ts # フィルタ・ソートロジック
│   ├── store/              # Zustand ストア
│   │   ├── animeStore.ts   # アニメデータ管理
│   │   └── authStore.ts    # 認証管理
│   ├── lib/                # ライブラリ設定
│   │   └── supabase.ts     # Supabase クライアント
│   ├── types/              # TypeScript型定義
│   │   └── index.ts        # 共通型
│   ├── App.tsx             # アプリルーティング
│   ├── main.tsx            # エントリーポイント
│   └── index.css           # グローバルスタイル
├── vercel.json             # Vercel設定（SPA用rewrites）
├── vite.config.ts          # Vite設定
└── tsconfig.json           # TypeScript設定
```

## データ更新

- Annictからのデータ取得はリアルタイム
- 評価データはSupabaseに保存
- アニメ情報は閲覧専用
