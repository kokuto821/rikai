<!-- matagi: Decisions では matagi の design-rule（shared-rules/design-principles/design-rule.md）の観点で代替案と比較する。apply 後のレビューは実装者が兼ねない（matagi-kaji の review-independence-rule: shared-rules/harness-engineering/review-independence-rule.md）。 -->

## Context

動機は proposal.md の Why を参照する。

バッジの文字列は `skills/rikai/scripts/statusline.mts` の定数1か所で決まり、テストは `__tests__/helpers/scriptTestHelpers.mts` の同名の定数を期待値にしている。`statusline.mts` は `flag.mts install` で `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` にコピーされ、利用者の statusline はそのコピーを実行する。`install` は既存のコピーを上書きする。

## Goals / Non-Goals

**Goals:**
- 表示文字列を `[rikai]` に変え、仕様・テスト・README・`SKILL.md` の表記を揃える。

**Non-Goals:**
- 旧表記 `[理解]` の併記や、設定による切り替えは行わない。
- 導入済みのコピーを自動で更新する仕組みは作らない。

## Decisions

### 表記は定数1か所で変える

`statusline.mts` の定数と、テストヘルパーの定数を書き換える。表示ロジックには手を入れない。代替案の「表記を設定で選べるようにする」は、バッジを出すだけの機能に対して過剰（YAGNI）なので採らない。

### 導入済みのコピーは自動更新しない

導入済みの利用者は、`install` を再実行すれば更新できる（`install` は上書きする）。導入済みなのは作者だけなので、README に再実行の案内は足さない。代替案の「statusline から起動時にコピーを更新する」は、仕様の「グローバル設定を自動編集しない」「導入は頼まれたときだけ」の方針と合わない。

### 旧表記を併記しない

`[理解] [rikai]` のように両方を出すと、バッジが長くなり、改名の目的（ひと目で分かる）に反する。コピーが古い間だけ `[理解]` が出る状態を許容する。

## Risks / Trade-offs

- [導入済みのコピーは `install` を再実行するまで `[理解]` のまま] → 導入済みなのは作者だけなので、作者が再実行する。表示専用の機能で、モードの動作には影響しない。
- [仕様の Purpose は差分に含められず、アーカイブで更新されない] → `openspec/specs/rikai-badge/spec.md` の Purpose を、タスクで直接編集する。
