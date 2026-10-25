<!-- matagi: 各タスクの実装は matagi:openspec-workflow スキル経由で進め、実装委譲先（matagi:tdd / matagi:coding / matagi:test-coding）をタスクごとに明記する。 -->

## 1. スクリプトとテスト

- [x] 1.1 `__tests__/helpers/scriptTestHelpers.mts` の `INDICATOR` を `[rikai]` にし、`__tests__/statusline.test.mts` のテスト名の表記を直す。テストが失敗すること（Red）を確認する。（委譲先: matagi:tdd）
- [x] 1.2 `skills/rikai/scripts/statusline.mts` の `INDICATOR` とコメントの表記を `[rikai]` にし、テストが通ること（Green）を確認する。（委譲先: matagi:tdd）
- [x] 1.3 `npm test`、`npm run typecheck`、`npm run lint` が通ることを確認する。（委譲先: matagi:tdd）

## 2. 仕様とドキュメント

md 資産のため、委譲先スキルは無い。`matagi:github-issue-resolve` が直接編集する。

- [x] 2.1 `openspec/specs/rikai-badge/spec.md` の Purpose の表記を `[rikai]` にする。要件とシナリオは、アーカイブ時に差分から反映される。
- [x] 2.2 `README.md` の `[理解]` の表記（13・34・54行付近）を `[rikai]` にする。確認済みの連結の文言は残す。
- [x] 2.3 `skills/rikai/SKILL.md` の `[理解]`（220行付近）を `[rikai]` にする。
- [x] 2.4 `[理解]` が残っていないことを `grep` で確認する。除外は、`openspec/changes/archive/`、この change のディレクトリ、`openspec/specs/rikai-badge/spec.md` の要件部分（アーカイブ時に差分から反映される）。
