## REMOVED Requirements

### Requirement: モード有効中にバッジを表示する
**Reason**: バッジは表示専用で、維持のコストに見合わない。会話圧縮ではセッションIDが変わらないので、モードが失われてもバッジが残り、表示が実態とずれる。
**Migration**: 代わりの表示は設けない。導入済みの場合は、`${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` と、`${CLAUDE_CONFIG_DIR:-~/.claude}/settings.json` の `statusLine` のうち rikai の部分を手で消す。

### Requirement: 起動時と終了時にフラグを書き換える
**Reason**: バッジの廃止に伴い、フラグが不要になる。
**Migration**: 不要。起動と終了は会話の文脈だけで成立する（rikai-session-mode）。

### Requirement: フラグをセッション別に持つ
**Reason**: バッジの廃止に伴い、フラグが不要になる。残ったフラグの掃除方法という未決事項も、併せて無くなる。
**Migration**: 導入済みの場合は、`active/` を含む `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` ごと手で消す。

### Requirement: statusline の出力はバッジ文字列のみにする
**Reason**: バッジの廃止に伴い、statusline のスクリプトが無くなる。
**Migration**: 他の statusline と連結している場合は、`statusLine` のコマンドから rikai の部分を除く。

### Requirement: statusline の導入ではグローバル設定を自動編集しない
**Reason**: バッジの廃止に伴い、導入の手順が無くなる。
**Migration**: 不要。

### Requirement: フラグとバッジは表示専用にする
**Reason**: バッジとフラグを廃止するため。モードが会話の文脈で決まることは、rikai-session-mode に残る。
**Migration**: 不要。
