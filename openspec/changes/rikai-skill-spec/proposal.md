## Why

対象 issue: #1。

rikai の設計は、設計インタビューの記録として `docs/design.md` の1ファイルに置かれている。観察できる振る舞い（仕様）、実装方針、未決事項が節の中で混在しており、確定・既定のラベルも本文に埋まっている。issue #1 で設計の合意形成に OpenSpec を使う方針としたため、仕様を `openspec/specs/` に、設計判断と未決事項を change の `design.md` に分けて持たせ、情報源を `openspec/` に一本化する。後続の実装 issue（`SKILL.md`、`scripts/`、manifest）は、この仕様を入力にする。

## What Changes

- `docs/design.md` の内容を、5つの capability の spec と change の `design.md` に再構成して移す。内容は落とさず、新しい決定は加えない。
- 確定・既定・未決・要確認の区別を維持する。確定・既定は spec または `design.md` の決定事項に、未決・要確認は `design.md` の Open Questions に置く。
- §6 開発プロセスは `AGENTS.md` と重複するため移さない。
- `docs/design.md` を指している参照を、移し先に更新する。
- `docs/design.md` を削除する。設計インタビューの経緯は git 履歴に残る。
- 実装（`SKILL.md`、`scripts/`、manifest）は含めない。別 issue で扱う。

## Capabilities

### New Capabilities

- `rikai-session-mode`: セッション持続モードの起動と終了、毎回の出力順、1ターンの流れ、他スキルとの併用時の出力の書き方
- `rikai-question-selection`: 毎回出す問い1問の選択（質問提案とクイズの機械選択）、質問提案の種類、クイズの形式
- `rikai-understanding-judgement`: ユーザーの返答の判定（根拠3つ、判定結果、コピペの扱い）
- `rikai-understanding-report`: 理解度レポートの項目、形式、スコープ、雛形、ファイル保存時の扱い
- `rikai-badge`: statusline の `[理解]` バッジ、セッション別フラグ、導入方式

### Modified Capabilities

なし。`openspec/specs/` に既存の spec は無い。

## Impact

- 追加: `openspec/changes/rikai-skill-spec/`。アーカイブ後に `openspec/specs/` へ5つの spec が入る。
- 変更: `AGENTS.md`（§1・§4・§7 を指す5箇所）、`README.md`（設計メモへのリンク）、`.claude/rules/genshijin-priority.md`（§5 を指す1箇所）、`openspec/config.yaml`（`context` の `docs/design.md` への言及）。
- 削除: `docs/design.md`。`docs/` はほかにファイルが無いため空になる。
- 影響しない: コードとスクリプト。実装はまだ存在しない。
