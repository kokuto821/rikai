# rikai-badge Specification

## Purpose
モードが有効であることを statusline で示すため、Claude Code の statusline に `[rikai]` バッジを表示し、そのフラグの持ち方と導入方式を定める。

## Requirements

### Requirement: モード有効中にバッジを表示する
モード有効中、rikai は Claude Code の statusline に `[rikai]` を表示しなければならない（SHALL）。genshijin の `[原始人]` と同様の表示とする。通常チャットには statusline が無いので、バッジは出ない。（確定）

#### Scenario: モード有効中の Claude Code
- **WHEN** Claude Code でモードが有効である
- **THEN** statusline に `[rikai]` が表示される

#### Scenario: モード解除後の Claude Code
- **WHEN** Claude Code でモードが解除されている
- **THEN** statusline に `[rikai]` は表示されない

#### Scenario: 通常チャット
- **WHEN** statusline の無い通常チャットでモードが有効である
- **THEN** バッジは出ない

### Requirement: 起動時と終了時にフラグを書き換える
Claude Code では、rikai は起動時と終了時に、バッジ用のフラグを書き換えなければならない（SHALL）。（確定）

#### Scenario: 起動時のフラグ
- **WHEN** Claude Code で rikai を起動する
- **THEN** バッジ用のフラグを有効に書き換える

#### Scenario: 終了時のフラグ
- **WHEN** Claude Code で rikai を終了する
- **THEN** バッジ用のフラグを解除に書き換える

### Requirement: フラグをセッション別に持つ
rikai は、バッジ用のフラグをセッション別に持たなければならない（SHALL）。場所は `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/active/<session_id>` とする。（既定）スキル側は `${CLAUDE_SESSION_ID}`、statusline 側は stdin JSON の `session_id` で、同じIDを得られる。別セッションにバッジが出ることを避ける。終了しなかったセッションのフラグが残る問題の掃除方法は未決である。

#### Scenario: 別セッションの表示
- **WHEN** あるセッションでモードが有効で、別のセッションではモードが有効でない
- **THEN** 別のセッションの statusline にはバッジが表示されない

### Requirement: statusline の出力はバッジ文字列のみにする
rikai の statusline の出力は、バッジ文字列のみでなければならない（SHALL）。他の statusline と連結できるようにするためである。（既定）

#### Scenario: 他の statusline との連結
- **WHEN** ユーザーが他の statusline と rikai のバッジを連結する
- **THEN** rikai の出力はバッジ文字列のみで、他の表示を含まない

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

### Requirement: フラグとバッジは表示専用にする
バッジ用のフラグと statusline は、表示専用でなければならない（SHALL）。モードの有効・無効は会話の文脈で決まり、フラグの有無、statusline の設定、バッジの表示に影響されてはならない（SHALL NOT）。フラグの書き込みが失敗しても、モードの起動と終了には影響させず、バッジが出ないまま進める。失敗はエラーを1行で伝える。（確定）

#### Scenario: statusline が未設定
- **WHEN** statusline が設定されていない状態で rikai を起動する
- **THEN** フラグは書き込まれ、モードは有効になる。バッジは表示されない

#### Scenario: フラグの書き込みが失敗
- **WHEN** `flag.mts on` または `flag.mts off` が失敗する
- **THEN** モードの起動または終了は成立し、エラーを1行で伝える
