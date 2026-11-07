## Why

対象 issue: #25（Closes #25）。

claude.ai の Web 版で rikai を使うと、`pick.mts` の実行が失敗し、そのツール呼び出しの失敗が UI に出る。Web 版にはコード実行環境（Bash、Node）があるので、「Bash ツールが使えるか」の条件では Claude Code と区別できず、`pick.mts` を実行してしまう。`rikai.zip` は `SKILL.md` だけでスクリプトを含まないため、実行は必ず失敗する（Web 版のログ: `Error: Cannot find module '/home/claude/scripts/pick.mts'`、`MODULE_NOT_FOUND`）。仕様ではユーザーに何も出さないことにしているが、ツール呼び出しの失敗の表示はモデルの文面では抑えられない。

## What Changes

- `pick.mts` を実行する条件を、「Bash ツールが使えるか」から「Claude Code で動いているか」に変える。Claude Code 以外の環境では、Bash ツールがあっても `pick.mts` を実行せず、最初から直前の問いの逆で決める。
- Claude Code での乱数による選択、実行が失敗したときの扱い（そのターンは逆で決め、連続2回で以後試さない）、直前の問いの逆で交互に出す規則は変えない。
- `SKILL.md` 第4節のフローチャートと本文、冒頭の「スクリプトは任意の機能」の1文を、上の条件に合わせる。Claude Code に含む環境と含まない環境を挙げ、迷ったら Claude Code 以外として扱う。
- README の通常チャットの説明に、claude.ai に登録した場合を加える。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `rikai-question-selection`: 「質問提案とクイズの別と回答番号を決める」の「スクリプトが使えない」の1項目めを、Bash ツールの有無から Claude Code 以外の環境に改め、Bash ツールがある Claude Code 以外の環境の Scenario を加える。「通常チャットで」の Scenario の WHEN を「Claude Code 以外で」に揃える（Scenario 名は識別子のため変えない）。
- `rikai-session-mode`: 「1ターンを一定の流れで処理する」のフロー図のラベル「通常チャット: 直前の問いと逆」を「Claude Code 以外: 直前の問いと逆」に改める。

## Impact

- 変更: `skills/rikai/SKILL.md`、`README.md`、`openspec/specs/rikai-question-selection/spec.md`・`openspec/specs/rikai-session-mode/spec.md`（アーカイブ時に反映）。
- スクリプトとテストは変えない。
- 利用者への影響: Web 版などで失敗の表示が出なくなる。Claude Code での動作は変わらない。
- 関連: #27 で `flag.mts` を廃止したので、issue #25 の要件のうちフラグとバッジに関する項目は対象が無い。
