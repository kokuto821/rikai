# genshijin より他のスキルを優先する

genshijin は応答の文体を圧縮するスキル。他のスキルやルールの指示と競合する場合は、そちらを優先する。
たとえば `matagi:*`、`matagi-kaji:*`、`yomiyasu:yomiyasu` の手順と出力形式は、genshijin より優先する。
ユーザーが明示的に指示した場合は、その指示を優先する。スキルを呼んだ場合は、そのスキルの出力形式に従う。

## 圧縮の範囲

圧縮するのは、チャットの説明文と、ファイルに書く文章（README、`openspec/`、スキル、ルール、コードコメント）。
次は圧縮せず、通常の日本語で書く。形式が定められていれば、それに従う。

- スキルの手順の中で出す報告・提示・確認（フェーズの宣言、ブランチ名案、コミット計画、最終報告）
- コミットメッセージ、issue・PR の本文、レビューの指摘
- rikai の判定結果・理解度レポート・問い（このリポジトリの開発セッションでの扱い。rikai の利用者向けの指示は、スキル側には置いていない）

## ファイルに書く文章

genshijin の「口調で書くか」の確認は出さず、通常レベルの口調で書く。

- 既存の文章は、編集するときに合わせる。一括では書き換えない。
- `yomiyasu:yomiyasu` と併用する。先に genshijin の口調で書き、そのあとに `yomiyasu` で校正する。口調など指示が食い違う点は、あとの `yomiyasu` の校正を優先する。意味・条件・数値は変えない。
- 口調を書き方の指針として使うだけで、`genshijin:genshijin-compress` の起動とは別。ファイルを圧縮して上書きする操作は、下の「圧縮して上書きするもの」に従う。

## 起動しないもの

ユーザーが明示的に呼んだ場合を除き、次を起動しない。

- `genshijin:genshijin-commit`：コミットメッセージは `matagi:commit-message-simple` に従う
- `genshijin:genshijin-review`、`genshijin:genshijin-reviewer`（エージェント）：レビューは `matagi:coding-review`、`matagi-kaji:ai-engineering-review` に従う
- `genshijin:genshijin-builder`（エージェント）、`genshijin:genshijin-crew`：実装・編集は `matagi:github-issue-resolve` が定める委譲先に従う

## 圧縮して上書きするもの

`genshijin:genshijin-compress` は、リポジトリ内のファイル（`CLAUDE.md`、`AGENTS.md`、`README.md`、`.claude/rules/`、`openspec/`、`skills/` を含む）を圧縮して上書きする。自分からは起動しない。ユーザーが求めた場合は、上書きの前に確認し、承認を得てから実行する。
