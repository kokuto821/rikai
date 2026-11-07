## Why

対象 issue: #27（Closes #27）。

statusline の `[rikai]` バッジは表示専用で、モードの動作には影響しない。それでも、起動・終了ごとのフラグの書き換え、導入手順（`flag.mts install`）、テストを抱え、残ったフラグの掃除方法は未決のままである。さらに、会話圧縮ではセッションIDが変わらないので、モードが失われてもバッジが残り、表示が実態とずれる。コストに見合わないので廃止する。

## What Changes

- **BREAKING** statusline の `[rikai]` バッジと、セッション別のフラグを廃止する。`rikai-badge` の全要件を削除する（REMOVED）。アーカイブ後に `openspec/specs/rikai-badge/` が残れば削除する。
- `rikai-session-mode` から、バッジ用のフラグと `flag.mts` のエラーへの言及を削る（MODIFIED）。モードが会話の文脈で決まることは変えない。
- スクリプト `flag.mts`・`statusline.mts` と、これらだけが使うモジュール、対応するテストを削除する。`pick.mts` と、それが使う `cli.mts`・`utils/randomPick.mts` は残す。
- `SKILL.md` から `flag.mts` の実行とバッジの節を除く。起動時に `pick.mts` の連続失敗の数を 0 に戻す処理は残す。
- README のバッジの節を、廃止した旨と、導入済みの設定を手で消す手順に置き換える。
- `openspec/changes/archive/` は経緯の記録なので書き換えない。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `rikai-badge`: 全要件を削除する。
- `rikai-session-mode`: 「セッション持続モードで動作する」からバッジ用のフラグへの言及を、「出力順序」から `flag.mts` のエラーへの言及を削る。

## Impact

- 削除: `skills/rikai/scripts/` の `flag.mts`・`statusline.mts`・`configPaths.mts`・`fsReal.mts`・`utils/sessionId.mts`・`utils/snippet.mts`、`__tests__/` の `flag.*.test.mts`・`statusline.test.mts`・`utils/sessionId.test.mts`・`utils/snippet.test.mts`。
- 変更: `__tests__/helpers/scriptTestHelpers.mts`、`skills/rikai/SKILL.md`、`README.md`、`skills/rikai/evals/README.md`、`openspec/specs/rikai-session-mode/spec.md`（アーカイブ後に反映）。
- 利用者への影響: 導入済みの利用者は、`${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` と `${CLAUDE_CONFIG_DIR:-~/.claude}/settings.json` の `statusLine` の rikai の部分を手で消す。消さなくても、コピー済みの `statusline.mts` はフラグが無いので何も表示しない。導入済みなのは作者だけ。
- バージョン: 要件の削除なので major に当たる（`.claude/rules/release.md`）。
- 関連: #25（Web版での失敗の表示）は `flag.mts` の失敗が原因と推定されており、本変更で解消する可能性がある。
