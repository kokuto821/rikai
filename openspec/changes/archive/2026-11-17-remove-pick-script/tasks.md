## 1. スクリプトとテストの削除

- [x] 1.1 `skills/rikai/scripts/`（`pick.mts`、`cli.mts`、`utils/randomPick.mts`）と、`__tests__/pick.test.mts`、`__tests__/utils/randomPick.test.mts` を削除する。`__tests__/helpers/scriptTestHelpers.mts` から `pick.mts` だけが使う定義（`createPickResult` など）を削り、`tsconfig.json` の include から `skills/rikai/scripts/**/*.mts` を外す。`npm test`・`npm run lint`・`npm run typecheck` が通ることを確かめる。`biome.json` の `files.includes` からも `skills/rikai/scripts/**` を外す（委譲先: matagi:coding。`biome.json` は設定ファイルのため直接編集した。削除だけで、新しい振る舞いもテストも足さないため `matagi:tdd` の Red は無い）

## 2. SKILL.md

- [x] 2.1 frontmatter の `allowed-tools` を削除する。第4節「質問提案かクイズかの決め方」のフローチャートと本文を、全環境で直前の問いの逆（最初は質問提案）にする内容に改め、`pick.mts`、Claude Code かどうかの判断、実行の失敗の扱いを削る。冒頭の「スクリプト（第4節）とファイル保存は Claude Code でだけ使う任意の機能」の1文も合わせる（委譲先: なし。md 資産のため直接編集する）
- [x] 2.2 第5節のレポートの保存と、第6節の起動の応答を、起動時は「レポートはチャット内に出す。ファイルに保存したいときは伝えてほしい」の旨だけを伝え（パスは示さない）、頼まれたら保存先を決める（指定が無ければ `.rikai/<topic>-rikai-report.md`、指定があればその場所で `.rikai/.gitignore` は作らない）、書けない環境では伝えてチャット内で続ける内容に改める（委譲先: なし。同上）

- [x] 2.3 レビューの指摘を反映する。保存を頼まれて書けるか迷ったら書けない環境として扱うこと、保存できない旨の1行を付随の通知に加えること、指定された保存先で読み替える範囲を保存先のディレクトリと再開時に探す場所に限ることを、`SKILL.md` と delta spec に書く。`rikai-session-mode` の2つの要件を「…案内する」「…形式の案内だけにする」に改名し、「毎回の出力を一定の順に並べる」の delta を加える。起動の応答の期待値が古い仕様のままだった `skills/rikai/evals/evals.json` と、その説明の `skills/rikai/evals/README.md` を合わせる（委譲先: なし。md 資産と eval の期待値のため直接編集する）

## 3. README

- [x] 3.1 `README.md` と `README.en.md` の「問いの出し方」「理解度レポート」「環境」の説明を、交互に出すことと、頼めばファイルに保存できることに合わせる（委譲先: なし。md 資産のため直接編集する）

## 4. 確認

- [x] 4.1 `openspec validate remove-pick-script --strict` が通り、delta spec と `SKILL.md` の記述が一致していることを確かめる。`SKILL.md` に `pick.mts`、`scripts/`、`CLAUDE_SKILL_DIR` が残っていないことを確かめる（委譲先: なし。確認作業）
- [x] 4.2 `npm run build:zip` で作った ZIP を claude.ai に登録し、`/rikai` のあと数回の回答で、`pick.mts` の実行が表示されず、問いが質問提案から交互に出て、起動時の案内に保存先のパスが無いことを確かめる。Claude Code（plugin）でも同じく確かめ、保存を頼むと `.rikai/<topic>-rikai-report.md` に保存されることを確かめる（委譲先: なし。ユーザーの手作業による確認。claude.ai での確認は済んだ。Claude Code での確認は、マージ後の `main` で #33 のリリース前の確認として行う）
