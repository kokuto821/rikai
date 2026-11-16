## Why

対象 issue: #46（Closes #46）。

claude.ai のチャットに `rikai.zip` を登録して使うと、`pick.mts` を実行して失敗し、そのツール呼び出しの失敗が表示される（ログ: `Error: Cannot find module '/root/.claude/skills/synced/<id>/rikai/scripts/pick.mts'`、`MODULE_NOT_FOUND`）。#25 で「Claude Code 以外では実行しない」としたが、claude.ai では `${CLAUDE_SKILL_DIR}` が `/root/.claude/skills/...` に置き換わり、Node もあるため、モデルが Claude Code と見分けられない。起動の応答でも、使えないファイル保存（`.rikai/<topic>-rikai-report.md`）を提案する。どちらも「Claude Code かどうか」の判断に頼っていることが原因で、指示の書き方では防げない。v1.0.0（#33）の前に直す。

## What Changes

- `pick.mts` を廃止する。質問提案とクイズの別は、全環境で直前の問いの逆にする（起動後の最初は質問提案）。機械的に選ぶ要件は変えない。**BREAKING**（Claude Code で乱数による選択が無くなる）
- 乱数の閾値、`pick.mts` の実行が失敗したときの扱い、連続2回の失敗で以後試さない規定、問いの種別のための Claude Code かどうかの判断を、仕様と `SKILL.md` から削除する。
- `skills/rikai/scripts/`（`pick.mts`、`cli.mts`、`utils/randomPick.mts`）と、それだけを対象にしたテスト（`__tests__/pick.test.mts`、`__tests__/utils/randomPick.test.mts`、ヘルパーの `createPickResult`）を削除する。`SKILL.md` の `allowed-tools` を削除する。
- 起動の応答で、レポート形式の提案をやめる。全環境で「レポートをファイルに保存したいときは伝えてほしい」旨だけを伝え、保存先のパスは示さない。
- 保存を頼まれたら、保存先を決める。ユーザーが場所を指定しなければ `.rikai/<topic>-rikai-report.md` にする。ファイルを書けない環境では、書けない旨を伝えてチャット内表示で続ける。
- README（日英）の「問いの出し方」「理解度レポート」「環境」の説明を合わせる。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `rikai-question-selection`: 「質問提案とクイズの別と回答番号を決める」を削除し、乱数とスクリプトの規定を除いた「質問提案とクイズを交互に出し、回答番号を決める」に置き換える。全環境で直前の問いの逆にする。
- `rikai-session-mode`: 「起動時にレポート形式を一度だけ提案する」を削除し、ファイル保存を頼めることを伝える「起動時にレポート形式を一度だけ案内する」に置き換える。「起動の応答は有効化の通知と形式の提案だけにする」を「…形式の案内だけにする」に改名し、保存の案内に合わせる。「毎回の出力を一定の順に並べる」の付随の通知に、保存できない旨の1行を加える。「1ターンを一定の流れで処理する」のフロー図の、問いの種別のラベルを改める。
- `rikai-understanding-report`: 「レポートの形式と更新」を、頼まれたときに保存先を決め、書けない環境ではチャット内で続ける形に改める。

（削除と追加にしたのは、OpenSpec が MODIFIED でのシナリオの削除を受け付けないため。）

## Impact

- 変更: `skills/rikai/SKILL.md`、`README.md`、`README.en.md`、`tsconfig.json`・`biome.json`（`skills/rikai/scripts/` の include）、`skills/rikai/evals/evals.json`（起動の応答の期待値）、`__tests__/helpers/scriptTestHelpers.mts`、`openspec/specs/` の3つの spec（アーカイブ時に反映）。
- 削除: `skills/rikai/scripts/`、`__tests__/pick.test.mts`、`__tests__/utils/randomPick.test.mts`。
- 変えない: `scripts/build-zip.mts` とそのテスト。`rikai.zip` の中身は `rikai/SKILL.md` だけのまま。
- 利用者への影響: claude.ai でスクリプトの失敗が表示されなくなり、使えない保存の提案も出なくなる。Claude Code では、問いの種別がランダムでなく交互になり、起動時の案内が保存先のパスを含まない形になる。
- バージョン: v1.0.0 は未リリースのため、この変更は v1.0.0 に含める（`version` は 1.0.0 のまま）。
