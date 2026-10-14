## Context

動機は proposal.md の Why を参照する。

- `docs/design.md` は、設計インタビュー（2026-10-14）の内容をまとめた1ファイルで、本 change の apply で削除する。入力はこのファイルで、観察できる振る舞いは specs（`rikai-*`）に移している。この `design.md` が持つのは、実装方針（§4）、このリポジトリの開発セッション向けの扱い（§5 の一部）、未決事項（§7）である。
- 現状のリポジトリには、スキル本体（`SKILL.md`、`scripts/`、manifest）が存在しない。`docs/`、`README.md`、`AGENTS.md`、`CLAUDE.md`、`.claude/`、`.gitignore`、`openspec/` のみがある。
- 「ユーザー」は rikai の利用者を指す。
- 設計メモの項目に付けたラベルは、次の意味で本書と specs にそのまま残している。見出しや導入文に付いたラベルは配下の項目に及び、項目に個別のラベルがあればそれを優先する。
  - 確定: 設計インタビューで、設計者が明示的に選んだ事項
  - 既定: 確認なしで置いた初期値。異論があれば変更する
  - 未決: まだ決まっていない事項。Open Questions に挙げる
  - 要確認: 外部仕様に依存し、確認が取れていない事項。Open Questions に挙げる

## Goals / Non-Goals

**Goals:**

- 観察できる振る舞いは specs に、実装方針と開発セッションの扱いは本書に、未決は Open Questions に分け、情報源を `openspec/` に一本化する。
- 確定・既定・未決・要確認の区別を、移行の前後で変えない。

**Non-Goals:**

- 新しい決定を加えない。設計メモに無い要件・シナリオを足さない。
- 実装（`SKILL.md`、`scripts/`、`tests/`、manifest）、`LICENSE` の追加は、別 issue で扱う。
- §6 開発プロセスは `AGENTS.md` を正とし、移さない。

## Decisions

### 情報の置き場を、仕様・設計・未決に分ける

仕様は `openspec/specs/` に、実装方針と開発セッションの扱いは change の `design.md` に、未決は `design.md` の Open Questions に置く。（本 change の決定）

- 代替案1: 1ファイルのまま `openspec/` へ移す。観点が混在したままで、OpenSpec で仕様を change として扱う利点を使えない。
- 代替案2: `docs/design.md` を残して `openspec/` に仕様を足す。同じ内容が2か所に残り、二重管理になる。
- 代替案3: `docs/design.md` を縮小して残す。縮小の範囲を決める必要があり、二重管理の恐れが残る。

### docs/design.md は削除し、参照を更新する

`docs/design.md` を削除し、これを指す参照（`AGENTS.md`、`README.md`、`.claude/rules/genshijin-priority.md`、`openspec/config.yaml`）を、移し先へ更新する。設計インタビューの経緯は git 履歴に残る。（本 change の決定。issue #1 の対応方針で、`docs/design.md` の縮小を別の作業としていたものを、ユーザーの指示で本 issue に含めた。）

参照の更新では、節番号（§1、§4、§5、§7）で指していたものを、移し先の spec 名または本書の節名に置き換える。

### 以下は設計インタビューで決まった事項を、そのまま引き継ぐ

引き継いだ事項の代替案は、設計メモに記録が無い。理由が残っているものだけ、理由を書く。

#### コアは `SKILL.md` だけで完結させる

- 通常のチャットと Claude Code の両方で使える。コアは `SKILL.md` だけで完結させる。（確定）
- スクリプト、フラグ、statusline、ファイル保存は Claude Code 向けの任意層とし、無くても動作する。（確定）
- アーキテクチャは [yomiyasu](https://github.com/nanaism/yomiyasu) を参考にした最小構成とする。（確定）

#### リポジトリの目標構成

最小構成（`SKILL.md` 単一ファイル、`scripts/`、`tests/`）とすることは確定。ファイルの拡張子とテストの実行方法は既定。以下は目標構成で、残りは以降の issue で追加する。

```text
rikai/
├─ .claude-plugin/
│   ├─ plugin.json
│   └─ marketplace.json
├─ skills/rikai/
│   ├─ SKILL.md              # 全ルールを一枚に集約
│   └─ scripts/              # Claude Code 専用の任意層
│       ├─ flag.mts          # フラグの on / off / install
│       ├─ statusline.mts    # [理解] バッジ
│       └─ pick.mts          # 質問提案 / クイズの機械選択
├─ tests/                    # node --test
├─ openspec/                 # 仕様（specs/）と change
├─ README.md
├─ AGENTS.md / CLAUDE.md
├─ .claude/
│   ├─ settings.json
│   └─ rules/genshijin-priority.md
├─ .gitignore
└─ LICENSE                   # 未決
```

設計メモの構成図では、`docs/design.md` が `# この文書` として載っていた。本 change で削除するため、`openspec/` に置き換えている。

#### スクリプトの実装方針

- スクリプトは `.mts` で書き、`node` で直接実行する。ビルドしない。テストは `node --test`。要件は Node 22.18 以上。（既定）
- `SKILL.md` の `allowed-tools` で、`pick.mts` と `flag.mts on|off` に限り確認なしで実行できるようにする。`flag.mts install` は `~/.claude/` への書き込みを伴うため、確認付きにする。（既定）
- `pick.mts` は乱数を引数で注入できるようにし、境界値（0.5）をテストできるようにする。（既定）
- `flag.mts` と `statusline.mts` は、`session_id` を `[A-Za-z0-9_-]` のみ許可し、symlink を拒否する。（既定）

#### スクリプトと spec の対応

- `pick.mts`: rikai-question-selection の機械選択
- `flag.mts`: rikai-badge のフラグの書き換えと、statusline の導入
- `statusline.mts`: rikai-badge のバッジ表示。`flag.mts install` が `${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/` にコピーする。plugin キャッシュのパスは更新で変わるため。（確定）

#### 他スキルとの併用（このリポジトリの開発セッション）

- このリポジトリでの genshijin と他のスキルの優先順位は、`.claude/rules/genshijin-priority.md` に定める。他のスキルを優先する。（確定）
  - このルールは散文で、genshijin が毎ターン注入する指示に対する優先は保証されない（ベストエフォート）。
  - 効くのは、このリポジトリの開発セッションだけ。rikai の利用者向けの対策は、`SKILL.md` の指示（rikai-session-mode の「併用スキルの文体に関わらず追加セクションを通常の日本語で書く」）で行う。これもベストエフォートである。
- 類似スキルの併用で指示が食い違う場合があることは、実装 issue で README を更新するときに記載する。（yomiyasu と同様。既定）

## Risks / Trade-offs

- [spec と design への再構成で、設計メモの内容を取りこぼす] → 削除の前に、`docs/design.md` の節ごとに移し先を突き合わせて確認する（tasks.md の 1）。経緯は git 履歴に残る。
- [実装前の仕様を `openspec/specs/` に確定させるため、実装の段階で食い違いが出る] → 食い違いは、実装 issue で change を立てて MODIFIED として更新する。既定の項目は、異論があれば変更する前提で書かれている。
- [節番号で参照していた箇所が、移し先で節番号を持たない] → 参照を spec 名または本書の節名に書き換える（tasks.md の 2）。
- [仕様を書いた人が、そのままレビューを兼ねる] → archive の前に、`matagi-kaji:ai-engineering-review` で、別エージェントが md 資産をレビューする。

## Migration Plan

1. 本 change の spec と design を追加する。
2. 参照を更新し、`docs/design.md` を削除する。
3. レビューを済ませてから archive し、`openspec/specs/` に5つの spec を反映する。

問題があれば、該当コミットを revert する。`docs/design.md` は git 履歴から復元できる。

## Open Questions

設計インタビューの時点で未決または要確認だった事項を、そのまま引き継ぐ。specs の振る舞いに影響する項目が決まった時点で、MODIFIED の delta として仕様を更新する。

### 出力

- 出力順の例外。
  - 返答のみのターン（回答本文が空になる場合）
  - 質問提案で「○○は何？」と尋ねられた場合の応答（判定は出るが、採点・正解提示の対象が無い）
  - 返答なしのターン
  - ファイル保存時にチャットへ出すのは全文か、差分と保存先パスか
  - 起動時の形式提案、「新レポート」通知、`.gitignore` の案内を出す位置
  - 問いセクションの見出し名
- 起動直後（素材が無い）の応答、`/rikai off` 時の最終レポート、`/rikai` の二重起動。
- AI自身が確認質問で終わる回答との関係。ツール実行の中間メッセージを「回答」に数えるか。

### 判定とレポート

- 用語の引用と、文単位のコピペの線引き。
- 「○○は何？」以外の形（どこ／仕組み／なぜ／具体的には）で尋ねた場合の判定。
- レポート項目の遷移規則（例: 理解できてない → 後で一致 → 理解した）。重複排除と、レポートが伸び続けないための上限。
- 出題元を直前の回答とする基本の例外。理解できてない箇所を再出題するか。

### 状態の保持

- 回答番号の定義（会話全体の通番か、レポート単位か。「回答」の単位）と、チャット内での保持方法。
- 「スクリプトが使えない」の範囲。Node が無い、スクリプトが失敗する、許可されていない場合も偶奇に落とすか。
- チャットのみ（ファイル無し）での、複数話題のレポートの保持と再開。話題切替時に、旧話題への「返答なし」をどこに記録するか。
- 会話圧縮や `/clear` の後に、前回レポートとモードを維持できるか。
- `<topic>` からファイル名を作るときの扱い（スラッシュ、日本語、衝突）。
- セッション別フラグの掃除方法（終了しなかったセッションの分）。
- `flag.mts install` を誰がいつ案内するか（初回起動時か、README の手順か）。statusline が未設定のときの案内。

### 外部仕様

- 公式ドキュメントで確認済み（2026-10-14）: `${CLAUDE_SESSION_ID}`、`${CLAUDE_SKILL_DIR}`（<https://code.claude.com/docs/en/skills>）、statusline の stdin JSON の `session_id`（<https://code.claude.com/docs/en/statusline>）。
- 要確認:
  - プラグイン名前空間とコマンド名（`/rikai` で呼べるか、`/rikai:rikai` になるか）
  - `allowed-tools` での `${CLAUDE_SKILL_DIR}` の展開
  - `CLAUDE_CONFIG_DIR` の扱い
  - `.mts` を直接実行できる Node の最小バージョン（22.18 を想定）
- `SKILL.md` の `description` のトリガー文言（通常チャットでの自然言語起動のため）。

### 検証

- `.claude/rules/genshijin-priority.md` が効いているかの観察。genshijin を有効にしたまま数ターン使い、次を確認する。
  - レビューの指摘が圧縮されないか
  - rikai 風の問いが圧縮されないか
  - コミットメッセージや PR 本文が圧縮されないか
  - `.md` の編集時に、口調の確認が出ないか
- 効かない場合の手段。`permissions.deny` による `genshijin:genshijin-compress` と `genshijin:genshijin-builder` の禁止、genshijin を個人設定へ移すこと、など。

### リポジトリ

- `LICENSE` の追加（別 issue 候補）。
- GitHub 側のブランチ保護（ruleset）の設定。matagi の hook は Claude Code セッション内の制約で、GitHub 側の保護の代わりにはならない。
- SemVer の運用（バージョンの所在、破壊的変更とみなす範囲）。
- 第三者の plugin（genshijin など）の参照を、タグなどで固定するか。現状は既定ブランチに追従する。
