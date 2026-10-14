## 1. 削除前の突き合わせ

- [x] 1.1 `docs/design.md` の節（冒頭の説明、§1〜§5、§7）ごとに、移し先の spec または `design.md` に内容があることを確認する。取りこぼしがあれば、移し先に追記する（§6 は移さない）（委譲先: なし。md 資産。`matagi:github-issue-resolve` の IMPLEMENT 表の最下段）

## 2. 参照の更新

- [x] 2.1 `AGENTS.md` の `docs/design.md` への参照5箇所（概要の1行目、Node の最小バージョン、SemVer の運用、スキルの配置、テストの配置）を、移し先の spec または `design.md` の節名に書き換える（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 2.2 `README.md` の設計メモへのリンクを、`openspec/` への導線に書き換える（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 2.3 `.claude/rules/genshijin-priority.md` の `docs/design.md` §5 への参照を、`rikai-session-mode` の併用スキルの要件に書き換える（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 2.4 `openspec/config.yaml` の `context` にある `docs/design.md` への言及を、`openspec/specs/` を参照する記述に書き換える（委譲先: なし。設定ファイル）

## 3. docs/design.md の削除

- [x] 3.1 `docs/design.md` を削除する（委譲先: なし。md 資産の削除）
- [x] 3.2 `docs/design.md` を指す参照が、`openspec/changes/` 配下を除いて残っていないことを `grep` で確認する（委譲先: なし。コマンドの実行のみ）

## 4. 検証

- [x] 4.1 `openspec validate rikai-skill-spec --strict` が成功する（委譲先: なし。コマンドの実行のみ）

## 5. レビュー指摘の適用

- [x] 5.1 `AGENTS.md` のスキル名（`matagi:openspec-workflow`）、Spec Management、Dev Workflow を、`openspec-rule` と `github-issue-resolve` の定めに合わせて直す（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 5.2 テスト基盤を vitest とし、`AGENTS.md` と `design.md`（実装方針、構成図、Open Questions）に反映する（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 5.3 `.claude/settings.json` の `permissions.deny` に `Skill(opsx:apply *)` と `Skill(opsx:archive *)` を追加する（委譲先: なし。設定ファイル）
- [x] 5.4 spec と design の移行の取りこぼし（`pick.mts` の呼び出し形、`flag.mts` の確定）と、義務の拡大（SHALL）、未決の明記、表現の不備を直す（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
- [x] 5.5 ラウンド2の指摘（図の並び、ARCHIVE の経路、判断基準の参照化、編集主体の統一、移行時に追加した項目の出所、ラベル、引用、表現）を適用する（委譲先: なし。md 資産。IMPLEMENT 表の最下段）
