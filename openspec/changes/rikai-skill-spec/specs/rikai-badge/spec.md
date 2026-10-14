## Purpose

モードが有効かどうかをユーザーがひと目で確認できるようにするため、Claude Code の statusline に `[理解]` バッジを表示し、そのフラグの持ち方と導入方式を定める。

## ADDED Requirements

### Requirement: モード有効中にバッジを表示する
モード有効中、rikai は Claude Code の statusline に `[理解]` を表示しなければならない（SHALL）。通常チャットには statusline が無いので、バッジは出ない。（確定）

#### Scenario: モード有効中の Claude Code
- **WHEN** Claude Code でモードが有効である
- **THEN** statusline に `[理解]` が表示される

#### Scenario: モード解除後の Claude Code
- **WHEN** Claude Code でモードが解除されている
- **THEN** statusline に `[理解]` は表示されない

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
rikai は、バッジ用のフラグをセッション別に持たなければならない（SHALL）。場所は `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/active/<session_id>` とする。（既定）スキル側は `${CLAUDE_SESSION_ID}`、statusline 側は stdin JSON の `session_id` で、同じIDを得られる。別セッションにバッジが出ることを避ける。

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

#### Scenario: 導入の実行
- **WHEN** ユーザーが statusline を導入する
- **THEN** スクリプトを `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` にコピーし、`settings.json` に追記するスニペットを表示する

#### Scenario: グローバル設定
- **WHEN** statusline の導入が完了する
- **THEN** グローバルの `settings.json` は編集されていない
