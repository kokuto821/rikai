# Dev Rule

rikaiの開発ルール。概要は [README.md](README.md)、設計は [docs/design.md](docs/design.md) を参照する。
個別のルールは `.claude/rules/` に置く。

## 前提

- Claude Codeで開発する。必須pluginは `matagi`、`matagi-kaji`（`.claude/settings.json` で有効化済み。初回はフォルダの信頼とpluginの導入の承認が要る）。
- `yomiyasu`（日本語の推敲）と `genshijin`（応答文体の圧縮）は任意。他のスキルとの優先順位は `.claude/rules/genshijin-priority.md` に従う。
- スクリプト（`.mts`）の実行にNodeが必要。最小バージョンは [docs/design.md](docs/design.md) §4 を参照する。

## Branch Strategy

Trunk Based Developmentを採用する。短命の作業ブランチを切り、PRでmainに取り込む。
保護ブランチの扱いと強制の範囲は、下のissue-driven-ruleに従う。`matagi` のhookはClaude Codeセッション内の制約で、GitHub側のブランチ保護の代わりではない。

## Version Management

SemVerを採用する。運用（バージョンの所在など）は未決。[docs/design.md](docs/design.md) §7 を参照する。

## Issue Management

issue駆動開発を採用する。リポジトリに残る変更（コード・設定・ドキュメント）は、issue経由で行う。
ブランチ名、1 issue = 1 branch = 1 PR、保護ブランチの扱いは、`matagi` のissue-driven-rule（`shared-rules/issue-driven-development/issue-driven-rule.md`）に従う。

- issueを発行：`matagi:github-issue-create`
- 課題解決：`matagi:github-issue-resolve`

## Skill Development

- スキルの新規作成は `matagi-kaji:create-skill`、レビューは `matagi-kaji:ai-engineering-review` を使う。どちらも `matagi:github-issue-resolve` の手順の中で呼ばれる。
- `matagi-kaji:create-skill` の既定の配置先（`plugins/matagi/skills/`）と、スキルに内包するルールの `rules/` への切り出しは、rikaiには当てはまらない。通常のチャットでも `SKILL.md` だけで完結させるため、`skills/rikai/SKILL.md` に全ルールを集約する（[docs/design.md](docs/design.md) §1、§4）。

## Testing

スクリプト（`.mts`）の開発はTDDで実装する（`matagi:tdd`）。テストは `node --test` で実行し、`tests/` に置く（[docs/design.md](docs/design.md) §4）。
