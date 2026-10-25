---
paths:
  - ".claude-plugin/**"
  - ".github/**"
  - "LICENSE"
---

# リリースとバージョニング

rikaiのバージョニング、リリース手順、リリースノート、ブランチ保護、CI、第三者pluginの扱い、ライセンスの方針を定める。

## 決定の経緯

`rikai-skill-spec` の `design.md` の Open Questions に、次の3件が残っていた。このルールで決着させる。

- SemVerの運用（バージョンの所在、破壊的変更とみなす範囲）：「バージョン」と「公開APIの範囲」で決める。
- GitHub側のブランチ保護（ruleset）：「`main` の ruleset」で決める。
- 第三者pluginの参照を固定するか：固定しない。「第三者pluginの扱い」を参照する。

`plugin.json` に `version` を書かないと、`main` にマージするたびに全利用者へ更新が届く。docsやopenspecだけの変更でも届いてしまうため、`version` を書き、更新を届けるタイミングをリリースで決める。

## バージョン

- バージョンの正は `plugin.json` の `version`。`marketplace.json` と `package.json` には書かない。
- 初回は `0.1.0` とする。次回のリリースは、変更の種類にかかわらず `1.0.0` にする。それ以降は下の SemVer の判定に従う。
- [SemVer 2.0.0](https://semver.org/lang/ja/) に従う。公開APIは `openspec/specs/` が定める振る舞いとする。
  - major：要件の削除、非互換な変更。仕様に書かれた表記（バッジ表記など）の変更も含む。
  - minor：要件の追加。
  - patch：仕様を変えない修正。

## リリース手順

1. リリース専用の作業ブランチ `chore/#N_release-vX.Y.Z` を切り、`plugin.json` の `version` を上げる。
2. PRで `main` にマージする。
3. マージ後のコミットにタグ `vX.Y.Z` を打ち、GitHub Releaseを作る。

- 長命のリリースブランチ（`release/*` など）は作らない。
- 通常の機能PRでは `version` を触らない。

## リリースノート

GitHub Releaseの本文を正とする。`CHANGELOG.md` は置かない。リリースのたびに二重管理になるため。

通常の日本語で書き、`yomiyasu:yomiyasu` で校正する。構成は次のとおり。

- 冒頭の要約：「rikai vX.Y.Z を公開しました。」に続く3〜5文。
- `## 背景と課題`：軽微なリリースでは省略できる。
- `## vX.Y.Z で変わったこと`：変更ごとに `###` を立て、PR・issue番号をつける。
- `## 確かめたこと`
- `## vA.B.C から使っている方へ`（vA.B.Cは前回のバージョン）：初回リリースを除き必須。影響がなければ「影響はありません」と書く。
- 末尾：差分リンク。

`## 数字で見る` は、測定した場合だけ置く任意の節とする。

## `main` の ruleset

- PR経由のマージを必須にする（直接pushを禁止する）。
- 承認数は0にする。
- force pushと削除を禁止する。
- bypassは認めない。
- タグ `v*` の削除と更新も禁止する。

## CI

- PRで `test`・`lint`・`typecheck` をNode 22で実行する。この3つをrulesetの必須チェックにする。
- タグのpushでは、`plugin.json` の `version` とタグ名が一致するかだけを検証する。
- リリース本文の自動生成はしない。

## 第三者pluginの扱い

開発環境の第三者plugin（`matagi`、`matagi-kaji`、`yomiyasu`、`genshijin`）は固定せず、既定ブランチに追従する。

## ライセンス

MITとする。ルートの `LICENSE` に全文を置き、`plugin.json` の `license` フィールドに `"MIT"` と書く。著作権者名は `plugin.json` の `author.name` と同じhandle名（`kokuto821`）にそろえる。
