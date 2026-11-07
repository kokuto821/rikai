# rikai

AIの回答をユーザーが理解できているかを確かめ、理解を促進するスキル。

## 状態

実装済み。`skills/rikai/SKILL.md`、スクリプト、plugin の manifest がある。バージョンはSemVerで管理し、[Releases](https://github.com/kokuto821/rikai/releases) で公開する。

## 概要

- 回答ごとに問いを1問出す（質問提案またはクイズ）
- ユーザーの返答から理解度を判定し、理解度レポートを更新する
- 通常のチャットでも使える。スクリプトと、レポートのファイル保存は Claude Code 向けの任意機能

## 導入

Claude Code では、plugin として導入する。

```bash
claude plugin marketplace add kokuto821/rikai
claude plugin install rikai@rikai
```

通常のチャットでは、`skills/rikai/SKILL.md` の内容を指示として貼る。claude.ai のチャットに `rikai.zip` で登録した場合も含め、Claude Code 以外ではスクリプトを実行しないので、質問提案とクイズの別は、直前に出した問いと逆の種別（最初は質問提案）で決まる。

## 使い方

- 起動: `/rikai`、または「rikaiを始めて」
- 終了: `/rikai off`、または「rikai終了」。終了の応答に、最終の理解度レポートが付く
- 同名の別コマンドとぶつかるときは、`/rikai:rikai` で呼ぶ

起動中は、全ての回答に、判定結果、理解度レポート、問い1問が付く。会話圧縮や `/clear` でモードが失われたときは、再度 `/rikai` で起動する。

## `[rikai]` バッジの廃止

statusline の `[rikai]` バッジは廃止した（#27）。バッジを導入していた場合は、次の順に手で消す。消さなくても、モードの動作には影響しない。

1. `${CLAUDE_CONFIG_DIR:-~/.claude}/settings.json` の `statusLine` から、rikai の部分を除く。rikai だけを指定していた場合は、`statusLine` ごと消す。他の statusline と連結していた場合は、`rikai/statusline.mts` を呼ぶ部分と、区切りの `printf " "` を除く。連結していた相手が1つだけなら、そのコマンドだけを指定する元の形に戻してよい。
2. `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` を削除する。

## 他のスキルとの併用

類似のスキル（文体を変えるスキルなど）と併用すると、指示が食い違う場合がある。たとえば、判定結果・理解度レポート・問いが、併用するスキルの文体で圧縮されることがある。出力が乱れる場合は、併用するスキルを無効にして使う。

## 入力欄のサジェスト

Claude Code は、入力欄に次の発言の予測を薄い文字で出すことがある（プロンプトサジェスト）。クイズの直後にその答えが出てしまうことがある。サジェストは Claude Code 本体の機能で、スキルからは抑えられない。答えが見えて困るときは、利用者の設定で無効にする。

- `/config` の Prompt suggestions をオフにする
- または `settings.json` に `"promptSuggestionEnabled": false` を書く
- または環境変数 `CLAUDE_CODE_ENABLE_PROMPT_SUGGESTION=false` を設定する（`/config` と `settings.json` のどちらよりも優先される）

## ドキュメント

- [仕様](openspec/specs/)（rikai の振る舞い。確定・既定・未決・要確認を区別して記載）
- [設計と未決事項](openspec/changes/archive/)（`archive/*-rikai-skill-spec/design.md`。実装方針と未決事項を記載）
- [開発ルール](AGENTS.md)
- [リリースとバージョニング](.claude/rules/release.md)

## ライセンス

[MIT License](LICENSE)
