<!-- matagi: 各タスクの実装は matagi:openspec-workflow スキル経由で進め、実装委譲先（matagi:tdd / matagi:coding / matagi:test-coding）をタスクごとに明記する。 -->

## 1. スキル本体（`skills/rikai/SKILL.md`）

- [x] 1.1 第1節（毎ターンの出力）と第2節（毎ターンの処理）を直す。回答番号を進めないターンの扱い（レポートと問いは出す）を足し、図に「数えるか」の分岐を足す。ファイル保存中はレポートをチャットに出さない旨を足す（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 1.2 第4節（問い）を直す。通常チャットの決め方を、偶奇から「直前の問いと逆（最初は質問提案）」に変える。回答番号の定義を、数えるターンの定義と起動と同じ発言の例外に合わせる。図も合わせる（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 1.3 第5節（理解度レポート）を直す。ファイル保存中は、レポートも保存先の案内もチャットに出さない旨を書く。回答番号の説明を、最後に数えた番号に合わせる（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 1.4 第6節（起動と終了）を直す。終了の応答で、ファイル保存中は最終レポートの代わりにパスを1行で並べる。図と補足を合わせる（委譲先: なし。md 資産。IMPLEMENT 表の最下段）

## 2. README

- [x] 2.1 README に「入力欄のサジェスト」節を足し、入力欄のサジェストがクイズの答えを示すときの対処（`promptSuggestionEnabled: false`、`/config` の Prompt suggestions）を足す（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 2.2 通常チャットの質問提案とクイズの別の説明を、「直前の問いと逆」に直す（委譲先: なし。md 資産。IMPLEMENT 表の最下段）

## 3. 検証

- [x] 3.1 `openspec validate rikai-skill-refine --strict` が成功する（委譲先: なし。コマンドの実行のみ）
- [x] 3.2 `claude plugin validate` が成功する（委譲先: なし。コマンドの実行のみ）
- [x] 3.3 `npm run typecheck`、`npm run lint`、`npm test` が成功する（スクリプトは変更しないことの確認）（委譲先: なし。コマンドの実行のみ）
- [x] 3.4 `SKILL.md` の図と本文が、更新した仕様（`rikai-question-selection`、`rikai-session-mode`、`rikai-understanding-report`）と食い違っていないことを確認する（委譲先: なし。レビューは REVIEW で別エージェントが行う）
