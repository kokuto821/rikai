## 1. 削除前の突き合わせ

委譲先: なし。md 資産の編集のため、`matagi:openspec-workflow` が直接編集する。

- [ ] 1.1 `docs/design.md` の節（冒頭の説明、§1〜§5、§7）ごとに、移し先の spec または `design.md` に内容があることを確認する。取りこぼしがあれば、移し先に追記する（§6 は移さない）

## 2. 参照の更新

委譲先: なし。md 資産と設定ファイルの編集のため、`matagi:openspec-workflow` が直接編集する。

- [ ] 2.1 `AGENTS.md` の `docs/design.md` への参照5箇所（概要の1行目、Node の最小バージョン、SemVer の運用、スキルの配置、テストの配置）を、移し先の spec または `design.md` の節名に書き換える
- [ ] 2.2 `README.md` の設計メモへのリンクを、`openspec/` への導線に書き換える
- [ ] 2.3 `.claude/rules/genshijin-priority.md` の `docs/design.md` §5 への参照を、`rikai-session-mode` の併用スキルの要件に書き換える
- [ ] 2.4 `openspec/config.yaml` の `context` にある `docs/design.md` への言及を、`openspec/specs/` を参照する記述に書き換える

## 3. docs/design.md の削除

委譲先: なし。md 資産の削除のため、`matagi:openspec-workflow` が直接行う。

- [ ] 3.1 `docs/design.md` を削除する
- [ ] 3.2 `docs/design.md` を指す参照が、`openspec/changes/` 配下を除いて残っていないことを `grep` で確認する

## 4. 検証

委譲先: なし。コマンドの実行のみ。

- [ ] 4.1 `openspec validate rikai-skill-spec --strict` が成功する
