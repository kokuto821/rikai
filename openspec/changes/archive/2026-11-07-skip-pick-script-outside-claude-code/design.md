## Context

`SKILL.md` 第4節は、問いの種別を決める最初の分岐を「Bash ツールが使えるか」にしている。claude.ai の Web 版にもコード実行環境（Bash、Node v22）があるので、この分岐に入って `pick.mts` を実行する。Web 版で確かめたログでは、スキルの置き場らしきパス（`/mnt/skills/plugins/rikai`）への `cd` も失敗し、`node scripts/pick.mts` は `MODULE_NOT_FOUND` で終わった。

## Goals / Non-Goals

**Goals:**

- Claude Code 以外の環境では `pick.mts` のツール呼び出しを1回も出さない。

**Non-Goals:**

- Web 版でスクリプトを動かすこと（`rikai.zip` への同梱は #23 で採用しなかった）。
- ファイル保存など、`pick.mts` 以外の Claude Code 向け機能の条件を見直すこと。

## Decisions

### 分岐の条件を「Claude Code で動いているか」にする

モデルが自分の実行環境（Claude Code か、それ以外か）を判断し、Claude Code のときだけ `pick.mts` を試す。

代替案との比較（design-rule の KISS・YAGNI の観点）:

- **Bash ツールの有無（現状）**: Web 版を Claude Code と区別できない。却下。
- **`${CLAUDE_SKILL_DIR}` が実際のパスに展開されているか**: Web 版のログでもスキルの置き場らしきパスが使われており、展開の有無で区別できる保証がない。却下。
- **実行前にスクリプトの有無を確かめる**: 確かめるためのツール呼び出し自体が毎回 UI に出る。問題が残る。却下。
- **`rikai.zip` にスクリプトを同梱する**: Web 版で `.mts` を Node が実行できる保証がなく、#23 で採用しなかった。却下。

判断の手がかりとして、Claude Code に含む環境（CLI、IDE 拡張、デスクトップアプリの Code、claude.ai/code）と含まない環境（デスクトップアプリを含む claude.ai のチャットへの登録、貼り付けた通常チャット）を挙げ、迷ったら Claude Code 以外として扱う既定を置く。取り違えたときの害は、Claude Code 以外と扱う側のほうが小さいため（下の Risks）。`allowed-tools` やプラグイン導入の有無のような手がかりは、環境ごとの扱いが文書で保証されていないので使わない。

条件は分岐の文言だけで表し、スクリプトや判定用の仕組みは足さない。失敗時の扱い（連続2回で以後試さない）は、Claude Code で判断を誤ったときの安全網としてそのまま残す。

## Risks / Trade-offs

- [モデルが環境を取り違える] → Claude Code を Web 版と取り違えると乱数が使われず交互になるだけで、出題は続く。逆に取り違えると従来どおり失敗が表示されうるが、連続2回で以後試さない。
- [Claude Code 以外の環境で、将来スクリプトが使えるようになる] → そのときに条件を見直す。現時点では同梱しないので対象外。
