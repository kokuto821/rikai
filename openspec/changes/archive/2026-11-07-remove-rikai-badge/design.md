<!-- matagi: Decisions では matagi の design-rule（shared-rules/design-principles/design-rule.md）の観点で代替案と比較する。apply 後のレビューは実装者が兼ねない（matagi-kaji の review-independence-rule: shared-rules/harness-engineering/review-independence-rule.md）。 -->

## Context

動機は proposal.md の Why を参照する。

`flag.mts` は起動・終了時のフラグの書き換え（`on`/`off`）と導入（`install`）を担い、`statusline.mts` はフラグを読んでバッジを出す。`configPaths.mts`・`fsReal.mts`・`utils/sessionId.mts`・`utils/snippet.mts` は、この2つからしか使われていない。`pick.mts` が使うのは `cli.mts` と `utils/randomPick.mts` だけである。テストの共通ヘルパー `__tests__/helpers/scriptTestHelpers.mts` には、フラグと statusline 用の定数・関数が混ざっている。

`SKILL.md` 第6節の図では、起動時の `FlagOn` ノードに「連続失敗の数を 0 に戻す」（`pick.mts` 用）が同居している。

## Goals / Non-Goals

**Goals:**
- バッジとフラグに関わるコード・テスト・記述を、残りの機能（`pick.mts`、起動と終了、レポート）を変えずに取り除く。

**Non-Goals:**
- セッションをまたいでモードを有効にする仕組みは作らない。
- 導入済みの利用者のファイルや設定を、自動で消す仕組みは作らない。
- `openspec/changes/archive/` の過去の記録は書き換えない。

## Decisions

### バッジを廃止する（セッションをまたいで有効にしない）

代替案は、SessionStart などの hook でモードを注入し、セッションをまたいで有効にする案。hook は Claude Code 専用で、Web版（`rikai.zip`）では動かない。「コアは `SKILL.md` だけで完結させる」「終了時に状態を破棄し、引き継がない」「外部要因で失われても復元しない」という確定方針と衝突するので、採らない。バッジだけ残す案は、表示が実態とずれる問題と、残ったフラグの掃除という未決事項が残るので、採らない（YAGNI、KISS）。

### 専用モジュールはまとめて削除する

`flag.mts`・`statusline.mts` からしか使われないモジュールは、汎用に見えても残さない。使い道の無いコードを残すのは YAGNI に反する。`cli.mts` は `pick.mts` が使うので残す。削除の後に、`npm run typecheck` で参照の取り残しが無いことを確かめる。

### テストは新しく書かず、削除と既存テストの通過で確かめる

振る舞いを足す変更ではないので、TDD の Red は作れない。削除の対象を `pick.mts`・`build-zip.mts` のテストが使っていないことを確かめたうえで、ヘルパーから不要な定義を除き、`npm test`・`typecheck`・`lint` の通過を完了条件にする。

### 連続失敗のリセットは起動の処理として残す

第6節の図の `FlagOn` ノードを `ResetFail` に改名し、「`pick.mts` の連続失敗の数を 0 に戻す」だけのノードにする。図の分岐（すでに有効か）は変えない。

### 導入済みの設定は README の手順で手動で消す

自動で消す案は、仕様が禁じていた「グローバル設定の自動編集」に当たる。導入済みなのは作者だけなので、README に手順を書くだけにする。

## Risks / Trade-offs

- [導入済みの `settings.json` の `statusLine` に、使われなくなったスクリプトへの参照が残る] → コピー済みの `statusline.mts` は `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` にあり、本変更では消えない。フラグが書かれないので何も表示しない。README の手順で消してもらう。
- [アーカイブで `rikai-badge` の要件が全て消えても、spec のファイルが空で残る] → アーカイブ後に `openspec/specs/rikai-badge/` が残っていれば削除する。

## Migration Plan

- リリースは major とする（要件の削除）。リリースノートに、導入済みの設定を消す手順への案内を書く。
- 戻すときは、本変更のコミットを revert する。
