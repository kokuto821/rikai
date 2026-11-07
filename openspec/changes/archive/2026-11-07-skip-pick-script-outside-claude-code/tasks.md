## 1. SKILL.md

- [x] 1.1 第4節のフローチャートの最初の分岐を「Claude Code で動いているか」に改め、「使えない（通常チャット）」の枝を「Claude Code 以外（通常チャット、Web 版など。Bash ツールがあっても実行しない）」にする。枝のラベルは 1.3 で「いいえ、または迷う（Bash ツールがあっても実行しない）」に改めた（委譲先: なし。md 資産のため `matagi:github-issue-resolve` が直接編集する）
- [x] 1.2 第4節の本文（「通常チャットなどでスクリプトが使えないときは」の段落）と、冒頭の「スクリプトとファイル保存は Claude Code 向けの任意の機能」の1文を、Claude Code 以外では `pick.mts` を実行しない旨に揃える（委譲先: なし。同上）

- [x] 1.3 レビューの指摘を反映する。Claude Code に含む環境・含まない環境と迷ったときの既定を `SKILL.md` と delta spec に書き、`rikai-session-mode` のフロー図のラベルの delta と、README の通常チャットの説明を加える（委譲先: なし。md 資産のため直接編集する）

## 2. 確認

- [x] 2.1 `openspec validate skip-pick-script-outside-claude-code --strict` が通り、delta spec と `SKILL.md` 第4節の記述が一致していることを確かめる（委譲先: なし。確認作業）
- [x] 2.2 `npm test` が通り、スクリプトとテストに変更が無いことを確かめる（委譲先: なし。確認作業）
