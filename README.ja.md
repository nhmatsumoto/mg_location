# MG Location: 戦術的災害対応プラットフォーム v1.1

![MG Location Banner](https://img.shields.io/badge/MG--Location-Resilience--v1.1-blueviolet?style=for-the-badge)
![Status Build](https://img.shields.io/badge/Build-Passing-success?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

[English](./README.md) | **日本語** | [Português](./README.pt.md)

**MG Location** は、自然災害（洪水、土砂崩れ、人道危機）シナリオにおける意思決定支援と運用調整のためのシステムです。主な目的は、ネットワークインフラが壊滅的な故障をきたした場合でも、**100%の運用可用性**を保証することです。

---

## 🎯 ミッション
複雑なデータを即時の戦術的行動に変換すること。MG Location は単なるダッシュボードではなく、インターネットが届かない場所でも機能するように設計されたフィールドツールです。

---

## 🏗️ レジリエンス・アーキテクチャ (v1.1)

バージョン 1.1 では、4 つの基本柱に焦点を当てた **Resilience-First（レジリエンス優先）** 設計が導入されました：

1. **Local-first (Offline Outbox)**: PWA アプリは IndexedDB を使用してインターネットなしで動作します。アクションはキューに入れられ、接続が確立されると自動的に同期されます。
2. **バイナリプロ토コル (MessagePack + Zstd)**: 重い JSON を Zstandard で圧縮された MessagePack に置き換え、データトラフィック。を最大 80% 削減しました。これは無線や衛星リンクにとって極めて重要です。
3. **イベントソーシング (DDD)**: システム内のすべての変更は不変のイベントとして扱われます。これにより、衝突の自動解決（CRDT-lite）と完全な監査が可能になります。
4. **エッジハブ (Decentralized Command)**: 隔離されたエリアで戦術的プロキシとして機能するローカルサーバー（Raspberry Pi など）をサポートします。

---

## 🚀 仕組み

### 1. コマンドセンター
降雨アラート、リスクエリア、救助チームのステータスをリアルタイムで可視化。**GDACS**、**USGS**、**INMET** のインテリジェンスを統合します。

### 2. 捜索救助活動
タスクの割り当て、捜索エリアの境界画定、現場チームの追跡のための戦術モジュール。

### 3. ロジスティクスと寄付
リソースの透明な管理、資金調達キャンペーン、運用経費の管理。

### 4. 時系列分析 (Scatter Plot)
イベントの深刻度と時間を分析し、ローカルイベントとグローバルイベントを単一の戦略的ビューに統合する戦術的分散グラフ。

---

## 🛠️ テクノロジースタック

- **Frontend**: React 19, Vite, Tailwind CSS (現代的な戦術デザイン)。
- **Backend**: Django 5.x, Django REST Framework (堅牢なコア)。
- **Data**: Postgres + Redis (中央) | IndexedDB (ローカル/アプリ)。
- **Protocols**: MessagePack, Zstandard, RESTful Events。
- **SSO/Auth**: Keycloak (エンタープライズレベルの識別。管理)。

---

## 💻 開発の開始

### 前提条件
- Docker & Docker Compose
- Node.js / Bun (ローカル用オプション)
- Python 3.11+ (ローカル用オプション)

### クイックスタート (Docker)
```bash
./dev.sh up
```
- **App**: `http://localhost:8088`
- **API**: `http://localhost:8001`

### データシード (重要)
ブラジル・ミナスジェライス州ウバ（Ubá）の洪水シミュレーションデータを投入するには：
```bash
./dev.sh seed
```

---

## 🤝 貢献のお願い

これは実際の社会的インパクトを持つ **オープンソース** プロジェクトです。さまざまな分野で助けを必要としています：

- **開発者**: 同期アルゴリズムの最適化、新しい AI モジュール。
- **UX スペシャリスト**: ストレス下や高輝度下での使用に適したインターフェースの改善。
- **GIS スペシャリスト**: より多くの地形モデルや衛星レイヤーの統合。
- **データアナリスト**: リスク予測モデルの作成。

### 参加方法
1. [オンボーディングガイド](docs/PROJECT_CONSOLIDATION_MG_LOCATION.md)を読む。
2. [実装ギャップ](docs/DEEP_IMPLEMENTATION_GAP_PLAN.md)を確認する。
3. *Issue* を作成するか、アイデアを *Pull Request* で送信してください。

---

## 📂 プロジェクト構成

```bash
├── apps/               # Django アプリケーション (バックエンド)
├── frontend-react/     # React アプリケーション (フロントエンド)
├── agents/             # AI エージェントと自動化
├── docs/               # 詳細なドキュメントと計画
├── dev.sh              # DX 用の戦術的ツール
└── Dockerfile.*        # 環境定義
```

---

## 📑 詳細ドキュメント
- 📖 [現在のアーキテクチャ](docs/ARCHITECTURE_CURRENT.md)
- ⚖️ [透明性ポリシー](docs/PRIVACY_TRANSPARENCY_POLICY.md)
- 🧪 [テスト計画](docs/SECURITY_TEST_CHECKLIST.md)

---

**MG Location © 2026** - レジリエントなテクノロジーで命を救うために開発されました。
