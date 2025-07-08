# Claude History Viewer (chistory)

Claude の履歴をディレクトリ毎に表示するコマンドラインツールです。

## 機能

- `~/.claude/projects` フォルダ内のプロジェクト一覧を表示
- プロジェクトを選択して履歴を表示
- ユーザーが入力したプロンプトのみを時系列で表示
- JSON/CSV形式でのエクスポート機能

## インストール

```bash
npm install
npm run build
```

## 使い方

### プロジェクト一覧と履歴表示

```bash
node dist/index.js list
```

または

```bash
npm run start list
```

### 履歴のエクスポート

```bash
# JSON形式でエクスポート
node dist/index.js export -f json -o output.json

# CSV形式でエクスポート
node dist/index.js export -f csv -o output.csv
```

### 開発モード

```bash
npm run dev list
```

## 表示される情報

- プロンプトの内容
- 入力日時
- セッションID
- 作業ディレクトリ

## ファイル構造

```
src/
├── index.ts          # メインのCLIアプリケーション
├── types.ts          # TypeScript型定義
└── lib/
    ├── history.ts    # 履歴データの取得・解析
    └── export.ts     # エクスポート機能
```

## 注意事項

- このツールは`~/.claude/projects`に保存されたClaude Code履歴を読み取ります
- JSONLファイルの形式に依存しているため、Claude Codeの形式変更により動作しなくなる可能性があります
- エクスポート機能は履歴の分析と振り返りのために使用してください