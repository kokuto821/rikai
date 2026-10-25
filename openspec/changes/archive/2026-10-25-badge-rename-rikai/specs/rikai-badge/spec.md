## MODIFIED Requirements

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
