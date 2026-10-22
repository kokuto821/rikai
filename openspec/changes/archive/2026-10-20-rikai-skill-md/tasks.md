<!-- matagi: 各タスクの実装は matagi:openspec-workflow スキル経由で進め、実装委譲先（matagi:tdd / matagi:coding / matagi:test-coding）をタスクごとに明記する。 -->

## 1. 外部仕様の確認

- [x] 1.1 `marketplace.json` のスキーマ（必須項目、`source` の書き方）を公式ドキュメントで確認する（委譲先: なし。調査のみ）
- [x] 1.2 Node 22.18 で `.mts` の型除去が既定で有効になることを、公式の変更履歴で確認する（委譲先: なし。調査のみ）

## 2. スキル本体

- [x] 2.1 `skills/rikai/SKILL.md` を作成する。5つの spec と delta の振る舞いを、単一ファイルで完結して書く。frontmatter は design.md の決定に従う（委譲先: なし。md 資産。IMPLEMENT 表の最下段。作成は `matagi-kaji:create-skill` の手順に従い、配置は `skills/rikai/` とする）
- [x] 2.2 `SKILL.md` の本文で、`pick.mts`、`flag.mts on`、`flag.mts off` を、`allowed-tools` のルールと一致する形で指示する（`flag.mts` の第2引数は `${CLAUDE_SESSION_ID}`）（委譲先: なし。md 資産。IMPLEMENT 表の最下段）

## 3. manifest と README

- [x] 3.1 `.claude-plugin/plugin.json` を作成する（`name`、`description`、`author`、`repository`。`version` と `license` は置かない）（委譲先: なし。設定ファイル）
- [x] 3.2 `.claude-plugin/marketplace.json` を作成する（委譲先: なし。設定ファイル）
- [x] 3.3 `README.md` の状態を実装済みに更新し、導入手順（plugin の導入、`flag.mts install`、statusline の設定）、`/rikai:rikai` の代替、類似スキルの併用で指示が食い違う場合があることを書く（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 3.4 statusline の連結例（標準入力を分配する例）を、genshijin と実際に連結して確認してから README に載せる（委譲先: なし。手動確認と md 資産）

## 4. 検証

- [x] 4.1 `openspec validate rikai-skill-md --strict` が成功する（委譲先: なし。コマンドの実行のみ）
- [x] 4.2 `claude plugin validate` が成功する（委譲先: なし。コマンドの実行のみ）
- [x] 4.3 `npm run typecheck`、`npm run lint`、`npm test` が成功する（スクリプトは変更しないことの確認）（委譲先: なし。コマンドの実行のみ）

## 5. レビュー指摘の適用

- [x] 5.1 `SKILL.md` を、毎ターンの出力契約（処理の手順、出力の順、問いの選び方、判定）を先頭近くに置く構成に並べ替える。起動・終了・ファイル保存・ファイル名の規則は後段へ回す（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 5.2 `SKILL.md` に、更新後の spec の内容を反映する: 回答番号の定義（最初の回答を 1、以後は直前の番号 + 1、起動・二重起動・終了の応答は数えない、最終レポートは直前の番号）、`pick.mts` の連続2回失敗後は偶奇のみ、付随通知の位置、更新した話題のレポートのみ出す、終了時は全話題のレポートと終了ターンの判定・記録、詳細を詰める型の質問の判定、ファイル保存時もチャットに出す、レポートの更新の暫定ルール（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 5.3 `SKILL.md` の `allowed-tools` から `pick.mts *` を削除し、本文に、`flag.mts install` の確認で拒否されたら実行せず終える旨を1文で書く（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 5.4 `SKILL.md` の重複を整理し、「決まっていないこと」の節を外す。見出し「別の決め方」を「質問提案かクイズかの決め方」に改める。終了語の判定を「rikai に言及した終了の依頼」に限定し、返答なしは黙って記録する旨を書く（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 5.5 併用スキルの扱いを外す: `SKILL.md` の第7節を削除する。`.claude/rules/genshijin-priority.md` の、`rikai-session-mode` の併用要件への参照を外す。`README.md` の併用の節を短い注意書きにする（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 5.6 `claude plugin install` を実際に実行して、`source: "./"` で配布物に含まれるファイルを確認する（委譲先: なし。手動確認）
- [x] 5.7 修正後の `SKILL.md`・spec・design を、実装者と別のエージェントが `ai-engineering-review` で再レビューする（最大2ラウンド）（委譲先: なし。レビュー）

## 6. 実機での確認

- [x] 6.1 bare の `/rikai` と `/rikai off` が通ることを確認する（委譲先: なし。手動確認）
- [ ] 6.2 `allowed-tools` により、`pick.mts` と `flag.mts on|off` が確認なしで動き、`flag.mts install` に確認が出ることを確認する（委譲先: なし。手動確認。`flag.mts on` と `${CLAUDE_SESSION_ID}` の展開は、非対話モードで確認済み。残りは対話セッションで確認する）
- [ ] 6.3 会話圧縮後にモードが維持されるかを観察する（委譲先: なし。手動確認）
- [x] 6.4 6.1〜6.3 の結果を spec と design に反映する（6.1 と 6.2 の一部。6.2 の残りと 6.3 は確認後に反映する）（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
