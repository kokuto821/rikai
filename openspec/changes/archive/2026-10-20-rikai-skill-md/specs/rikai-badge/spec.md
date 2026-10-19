## MODIFIED Requirements

### Requirement: statusline の導入ではグローバル設定を自動編集しない
rikai の statusline の導入は、次の方式でなければならない（SHALL）。（確定）

- statusline のスクリプトを `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` にコピーする。plugin キャッシュのパスは更新で変わるため。
- `settings.json` に追記するスニペットを表示する。グローバル設定は自動編集しない。

導入（`flag.mts install`）は、ユーザーが頼んだときだけ、確認付きで実行する。起動時には自動で案内しない。導入手順は README に書く。他の statusline と連結する場合の手順（標準入力を分配する例）も README に書く。（確定）

#### Scenario: 導入の実行
- **WHEN** ユーザーが statusline を導入する
- **THEN** スクリプトを `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` にコピーし、`settings.json` に追記するスニペットを表示する

#### Scenario: グローバル設定
- **WHEN** statusline の導入が完了する
- **THEN** グローバルの `settings.json` は編集されていない

#### Scenario: 導入の依頼
- **WHEN** ユーザーがバッジを出したいと頼む
- **THEN** 確認を取って `flag.mts install` を実行し、出力されたスニペットと連結の注意をそのまま伝える

#### Scenario: 起動時
- **WHEN** rikai を起動する
- **THEN** statusline の導入を自動では案内しない

## ADDED Requirements

### Requirement: フラグとバッジは表示専用にする
バッジ用のフラグと statusline は、表示専用でなければならない（SHALL）。モードの有効・無効は会話の文脈で決まり、フラグの有無、statusline の設定、バッジの表示に影響されてはならない（SHALL NOT）。フラグの書き込みが失敗しても、モードの起動と終了には影響させず、バッジが出ないまま進める。失敗はエラーを1行で伝える。（確定）

#### Scenario: statusline が未設定
- **WHEN** statusline が設定されていない状態で rikai を起動する
- **THEN** フラグは書き込まれ、モードは有効になる。バッジは表示されない

#### Scenario: フラグの書き込みが失敗
- **WHEN** `flag.mts on` または `flag.mts off` が失敗する
- **THEN** モードの起動または終了は成立し、エラーを1行で伝える
