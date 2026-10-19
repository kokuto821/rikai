<!-- matagi: 対象 issue 番号（Closes #<番号>）を冒頭の Why に明記する。issue の粒度・ブランチ運用は matagi の issue-driven-rule（shared-rules/issue-driven-development/issue-driven-rule.md）に従う。進行は matagi:openspec-workflow スキル経由で行う。 -->

## Why

対象 issue: #4。

仕様（`openspec/specs/` の5つ）とスクリプト（#3）は揃ったが、スキル本体の `skills/rikai/SKILL.md` と plugin の manifest が無く、rikai をまだ使えない。`SKILL.md` は指示文なので、未決のままだとAIの挙動が毎回ぶれる。回答番号の定義、「スクリプトが使えない」の範囲、起動直後と終了時の応答、返答なしの条件など、頻出するのに決まっていない項目を先に決め、spec へ戻してから `SKILL.md` に書く。あわせて、外部仕様の「要確認」のうち、公式ドキュメントで確認できたものを確定する。

## What Changes

- `skills/rikai/SKILL.md` を追加する。5つの spec の振る舞いを、`SKILL.md` だけで完結して書く。別ファイルへ切り出さない。
- `.claude-plugin/plugin.json` と `.claude-plugin/marketplace.json` を追加する。`version` は設定しない（SemVer の運用は未決のまま）。
- `README.md` の状態を実装済みに更新する。導入手順（plugin の導入、`flag.mts install`、statusline の連結例）と、類似スキルの併用で指示が食い違う場合があることを書く。
- 実装に必要な最小限の未決事項を決め、spec の MODIFIED として反映する。
  - 回答番号を会話全体の通番とし、起動後の最初の回答を 1 とする。
  - 「スクリプトが使えない」は、Bash ツールが無い場合と、`pick.mts` の実行が失敗した場合（原因を問わない）とする。この場合は偶奇に落とす。連続2回失敗したら、そのセッションは以後偶奇のみにする。
  - 起動直後の応答、`/rikai off` への応答（全話題の最終レポート、問いなし）、二重起動、未起動の `off` の応答を定める。起動・二重起動・終了の応答は回答番号に数えない。
  - 返答のみのターンと、詳細を詰める型の質問（何？／どこ？／仕組み？／なぜ？／具体的には？）への応答の出力順を定める。これらの質問は、すべて「理解できてない」と判定する。
  - 付随の通知（新レポート、`.gitignore` の案内）の位置を、回答本文の直前の1行ずつと暫定する。出力するレポートは、そのターンの話題と判定や返答なしを記録した他の話題のみとする。ファイル保存時もチャットにレポートを出す。
  - 「返答なし」の条件を、前回の問いに対する返答が無いことに統一する。判定は返答の対象の話題のレポートに、返答なしは前回の問いの出題元の話題のレポートに記録する。
  - モードの有効・無効は会話の文脈で決まり、フラグとバッジは表示専用とする。フラグの書き込みが失敗しても、モードの起動と終了には影響させない。
  - レポートのファイル名の `<topic>` の作り方を定める。
  - コマンド名は、frontmatter の `name: rikai` により `/rikai` と `/rikai off` で受け付ける、と確定する。
- 併用スキルの文体に関する要件（`rikai-session-mode`）を削除し、`SKILL.md` からも外す。README には、併用で指示が食い違う場合がある旨の注意書きだけ残す。`.claude/rules/genshijin-priority.md` の spec への参照を外す。
- 以下は未決のまま残す。会話圧縮や `/clear` によるモードの喪失は許容する。`.rikai/` の gitignore の扱いは #6 で変える。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `rikai-session-mode`: 併用スキルの文体の要件の削除、起動直後・終了時・二重起動の応答、返答のみのターンと詳細を詰める型の質問への応答の出力順、付随の通知の位置、ターン処理の流れにおける「返答なし」の条件と記録先、コマンド名の確定
- `rikai-question-selection`: 回答番号の定義、「スクリプトが使えない」の範囲とフォールバック（連続失敗の扱いを含む）
- `rikai-understanding-judgement`: 詳細を詰める型の質問の判定、「返答なし」の条件と記録先
- `rikai-understanding-report`: 雛形の回答番号の扱い、ファイル保存時のチャット出力、項目の更新の暫定ルール、レポートのファイル名の `<topic>` の作り方
- `rikai-badge`: フラグとバッジを表示専用とする原則、フラグ書き込み失敗時の扱い、`flag.mts install` の案内の出し方

## Impact

- 追加: `skills/rikai/SKILL.md`、`.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json`、`openspec/changes/rikai-skill-md/`。
- 変更: `README.md`、`.claude/rules/genshijin-priority.md`。アーカイブ後に、`openspec/specs/` の5つの spec が更新される。
- 影響しない: スクリプト（`skills/rikai/scripts/`）とそのテスト。`.rikai/` の gitignore の扱いは #6 で扱う。
- 実機で確認する項目（`/rikai` の綴り、`allowed-tools` の許可、statusline の連結）は、実装後に手動で確認し、結果を spec に反映する。
