<!-- matagi: 各タスクの実装は matagi:openspec-workflow スキル経由で進め、実装委譲先（matagi:tdd / matagi:coding / matagi:test-coding）をタスクごとに明記する。 -->

## 1. スクリプトとテスト

- [x] 1.1 `skills/rikai/scripts/` の `flag.mts`・`statusline.mts`・`configPaths.mts`・`fsReal.mts`・`utils/sessionId.mts`・`utils/snippet.mts` と、`__tests__/` の `flag.*.test.mts`・`statusline.test.mts`・`utils/sessionId.test.mts`・`utils/snippet.test.mts` を削除する。`cli.mts`・`pick.mts`・`utils/randomPick.mts` は残す。（委譲先: matagi:coding）
- [x] 1.2 `__tests__/helpers/scriptTestHelpers.mts` から、残るテスト（`pick`・`build-zip`・`utils/randomPick`）が使わない定数と関数を除く。（委譲先: matagi:coding）
- [x] 1.3 `npm test`、`npm run typecheck`、`npm run lint` が通ることを確認する。（委譲先: matagi:coding）

## 2. スキルとドキュメント

md 資産のため、委譲先スキルは無い。`matagi:github-issue-resolve` が直接編集する。

- [x] 2.1 `skills/rikai/SKILL.md` から `flag.mts` とバッジの記述を除く。対象は `allowed-tools`、冒頭の説明（10・16・22行付近）、第6節の図の `FlagOn`/`FlagOff`、実行するコマンドの項目、「バッジ」の節。起動時に連続失敗の数を 0 に戻す処理は残す。
- [x] 2.2 `README.md` の13行付近のバッジへの言及を除き、「`[rikai]` バッジ」の節を、廃止した旨と導入済みの設定（`${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/`、`settings.json` の `statusLine`）を手で消す手順に置き換える。
- [x] 2.3 `skills/rikai/evals/README.md` のバッジ表示と `flag.mts` の項目を削除する。
- [x] 2.4 `flag.mts`・`statusline.mts`・`[rikai]` バッジへの言及が残っていないことを `grep` で確認する。除外は、`openspec/changes/archive/`、この change のディレクトリ、`openspec/specs/rikai-badge/` と `openspec/specs/rikai-session-mode/spec.md`（アーカイブで反映する）、`eval-result/`（測定時点の記録）、README の廃止の案内。

## 3. アーカイブ後の後始末

- [x] 3.1 アーカイブ後に `openspec/specs/rikai-badge/` が残っていれば削除する。
