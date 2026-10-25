## Why

対象 issue: #12（Closes #12）。

statusline のバッジは `[理解]` と表示される。並んで表示される他のバッジ（例: genshijin の `[原始人]`）から、rikai のモードだと読み取りにくい。スキル名と同じ `[rikai]` に揃え、何のモードかをひと目で分かるようにする。

## What Changes

- statusline のバッジ表記を `[理解]` から `[rikai]` に変える。モード有効中は `[rikai]` を表示し、無効のときは従来どおり何も表示しない。
- `rikai-badge` の仕様で、バッジ表記が `[理解]` と書かれた箇所（Purpose、要件、シナリオ）を `[rikai]` に直す。要件とシナリオは差分（MODIFIED）からアーカイブ時に反映し、Purpose は差分に含められないので直接編集する。
- 実装（`statusline.mts`）、テスト、README、`SKILL.md` の表記を仕様に揃える。README の「genshijin のバッジと並べて表示されることを確認している」という記述は、表記だけを置き換え、確認済みの文言は残す。
- `openspec/changes/archive/` 配下は、変更の経緯を残す記録なので書き換えない。
- フラグの持ち方、導入方式、出力がバッジ文字列のみであることは変えない。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `rikai-badge`: モード有効中に表示するバッジの文字列を `[理解]` から `[rikai]` に変える。

## Impact

- 変更: `openspec/specs/rikai-badge/spec.md`（アーカイブ後に反映）、`skills/rikai/scripts/statusline.mts`、`__tests__/statusline.test.mts`、`__tests__/helpers/scriptTestHelpers.mts`、`README.md`、`skills/rikai/SKILL.md`。
- 利用者への影響: statusline のスクリプトは `flag.mts install` で `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` にコピーされる。導入済みの利用者は、コピー済みのスクリプトが古いままなので、`install` を再実行するまで `[理解]` と表示される。導入済みなのは作者だけなので、再実行の案内は README に書かない。`settings.json` の設定は変えなくてよい。
- 影響しない: フラグの場所と書き換え、`flag.mts` の挙動、statusline の導入手順。
