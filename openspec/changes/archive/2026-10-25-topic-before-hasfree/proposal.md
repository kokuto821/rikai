<!-- matagi: 対象 issue 番号（Closes #<番号>）を冒頭の Why に明記する。issue の粒度・ブランチ運用は matagi の issue-driven-rule（shared-rules/issue-driven-development/issue-driven-rule.md）に従う。進行は matagi:openspec-workflow スキル経由で行う。 -->

## Why

対象 issue: #10。

第2節のフローは、`HasFree`（仮説や質問の判定）、`Count`（回答番号）、`Topic`（話題の変化）の順になっている。`HasFree` で記録する時点では、記録先になりうる新しい話題のレポートが、まだ作られていない。そのため `SKILL.md` の `JudgeFree` ノードに「新しい話題なら、次で作るレポートに記録する」という条件が入っている。ノードの中に条件が入ると、図の分岐として読めず、`Topic` の判定と二重になる。

`Topic` は、ユーザーの発言だけで決まり、`HasAnswer` や `HasFree` の判定結果には依存しない。先に `Topic` を判定すれば、`HasFree` で記録する時点で、記録先のレポートが確定する。

## What Changes

- `SKILL.md` 第2節のフローで、`Topic` を `HasFree` の前に移す。順序は、返答の判定・返答なしの記録 → `Topic` → `HasFree` → `Count` → 回答本文になる。
- `SKILL.md` の `JudgeFree` ノードから、「新しい話題なら、次で作るレポートに記録する」の注記をなくす。
- 仕様 `rikai-session-mode` の「1ターンを一定の流れで処理する」のフローと、順序に触れるシナリオを、同じ順序にそろえる。
- `Count` ノードの括弧書き（起動と同じ発言への回答は含まれなくても数える）を、ノード「ユーザーが新しく起動した発言に、依頼が含まれるか」に分ける。条件を分岐として図に出すためで、数える条件は変えない。
- あわせて、フローのノードに抜けていた主語（ユーザーの発言、AIの問い）を補う。`HasAnswer` ノードの括弧書き（返答の例）は、`SKILL.md` では第3節と第4節に同じ内容があるため、仕様のフローからも消して、`SKILL.md` にそろえる。
- `Topic` ノードに、比較対象（前回の回答。回答本文、問い、最後に記録したレポートを含む）を明記する。
- `Split` ノードと `JudgeFree` ノードに、発言に複数の話題があるときは、話題ごとにレポートを分け、仮説や質問をそれが扱う話題のレポートに記録することを明記する。旧フローの `JudgeFree` も対象の話題に記録していたので、既存の判断を文にしたものである。
- 回答番号の数え方、返答なしの記録、「新レポート」通知の位置は、これまでどおり。上の明記は、判断の基準を新しく決めるものではない。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `rikai-session-mode`: 1ターンの処理の流れで、話題の変化の確認を、問いとは無関係な仮説や質問の確認より前に置く。合わせて、順序に触れるシナリオを直す

## Impact

- `skills/rikai/SKILL.md`: 第2節のフロー
- `openspec/specs/rikai-session-mode/spec.md`: 要件「1ターンを一定の流れで処理する」のフローとシナリオ
- スクリプト（`.mts`）、README、他の仕様への影響はない
