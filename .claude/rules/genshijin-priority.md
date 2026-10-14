# genshijin より他のスキルを優先する

genshijin は応答の文体を圧縮するスキル。他のスキルやルールの指示と競合する場合は、そちらを優先する。
たとえば `matagi:*`、`matagi-kaji:*`、`yomiyasu:yomiyasu` の手順と出力形式は、genshijin より優先する。
ユーザーが明示的に指示した場合は、その指示を優先する。スキルを呼んだ場合は、そのスキルの出力形式に従う。

## 圧縮の範囲

圧縮するのは、チャットの説明文だけ。
次は圧縮せず、通常の日本語で書く。形式が定められていれば、それに従う。

- スキルの手順の中で出す報告・提示・確認（フェーズの宣言、ブランチ名案、コミット計画、最終報告）
- コミットメッセージ、issue・PR の本文、レビューの指摘
- ファイルに書く文章（README、`openspec/`、スキル、ルール）。このとき genshijin の「口調で書くか」の確認は出さない
- rikai の判定結果・理解度レポート・問い（[rikai-session-mode](../../openspec/specs/rikai-session-mode/spec.md) の「併用スキルの文体に関わらず追加セクションを通常の日本語で書く」）

## 起動しないもの

ユーザーが明示的に呼んだ場合を除き、次を起動しない。

- `genshijin:genshijin-commit`：コミットメッセージは `matagi:commit-message-simple` に従う
- `genshijin:genshijin-review`、`genshijin:genshijin-reviewer`（エージェント）：レビューは `matagi:coding-review`、`matagi-kaji:ai-engineering-review` に従う
- `genshijin:genshijin-builder`（エージェント）、`genshijin:genshijin-crew`：実装・編集は `matagi:github-issue-resolve` が定める委譲先に従う

## 圧縮して上書きするもの

`genshijin:genshijin-compress` は、リポジトリ内のファイル（`CLAUDE.md`、`AGENTS.md`、`README.md`、`.claude/rules/`、`openspec/`、`skills/` を含む）を圧縮して上書きする。自分からは起動しない。ユーザーが求めた場合は、上書きの前に確認し、承認を得てから実行する。
