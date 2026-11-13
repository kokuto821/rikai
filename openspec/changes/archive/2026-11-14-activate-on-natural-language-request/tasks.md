## 1. SKILL.md と README

- [x] 1.1 `skills/rikai/SKILL.md` の description に、名指しなしの起動の条件（これからの回答ごとに理解度を確かめる依頼）、名指しなしの終了の条件（問いとレポートの停止を求める発話）、起動しない代表例（一回きりのクイズ作成や診断）を足す（委譲先: なし。md 資産のため、実行フェーズのスキル `matagi:issue-driven-workflow`（AGENTS.md の `matagi:github-issue-resolve` に当たる）が直接編集する）
- [x] 1.2 `SKILL.md` の冒頭の、起動・終了の指示の例に、名指しなしの発話を足す（委譲先: なし。同上）
- [x] 1.3 `SKILL.md` の第6節の図と箇条書きに、名指しなしの起動と終了の条件、当たらない発話、判断できない起動の確認の1行と返事の扱い、判断できない終了は続けること、有効でないときの名指しなしの終了は通常どおり処理することを足す（委譲先: なし。同上）
- [x] 1.4 `README.md` と `README.en.md` の起動と終了の説明に、名指しなしでも起動・終了できることを足す（委譲先: なし。同上）

## 2. 評価データ

- [x] 2.1 `skills/rikai/evals/trigger-evals.json` に、判断できない起動の依頼（「Reactのhooks、ちゃんと理解できてるか確かめてほしい」）を足す。iteration 6・7 で description を直しても発火しなかったため、ユーザーの判断で `should_trigger: false` とする（委譲先: なし。評価データの編集）
- [x] 2.2 `skills/rikai/evals/evals.json` に、名指しなしの起動と依頼（eval 17）、判断できない起動の依頼（eval 18）、モード有効中の名指しなしの終了（eval 19）、今の問いだけを断る発言（eval 20）、起動の確認への肯定（eval 21）を足す。eval 20・21 はレビューの指摘を受けて足した（委譲先: なし。同上）
- [x] 2.3 `skills/rikai/evals/README.md` のケースの件数と一覧を、2.1・2.2 に合わせて直す（委譲先: なし。md 資産）

## 3. 測定と記録

- [x] 3.1 trigger 評価を、iteration 3 と同じ手順（リポジトリの外、逐次、1 クエリ 3 回）で測り直す（委譲先: なし。評価の実行）
- [x] 3.2 eval 17〜21 を、スキルあり・なしで1回ずつ実行し、expectations に照らして採点する。実行は別エージェント（subagent）に任せる（委譲先: subagent。評価の実行）
- [x] 3.3 `eval-result/rikai.md` に、3.1・3.2 の結果と履歴の行を足し、改善案1を反映済みにする（委譲先: なし。md 資産）

## 4. 確認

- [x] 4.1 `openspec validate activate-on-natural-language-request --strict` が通り、delta spec と `SKILL.md` の記述が一致していることを確かめる（委譲先: なし。確認作業）
- [x] 4.2 `npm test` が通り、スクリプトとテストに変更が無いことを確かめる（委譲先: なし。確認作業）
