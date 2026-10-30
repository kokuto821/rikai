# rikai 評価結果

- 対象スキル: `skills/rikai/SKILL.md`
- 評価日: 2026-10-30（eval は iteration 2、trigger は iteration 3）
- 評価モデルと effort: iteration 1 は実行・採点・trigger の改善案ともに `claude-sonnet-5-5`（effort 不明）。iteration 2 の実行は subagent（モデル不明、effort `lower`）。採点は評価セッション内で expectations に照らして手動で行い、grader subagent は使っていない。iteration 3 の trigger は `claude -p` の既定モデル（`claude-opus-5-5`）
- 合否判定: **PASS**（iteration 2 の eval スキルあり合格率 100%（38/38）。合格基準は 90%。未採点のケースなし。iteration 3 の trigger は 15/15 合格）
- 改善案: 下の「改善案」を参照。**いずれも `SKILL.md` に未反映**
- 生出力: eval は `eval-result/iterations/rikai/iteration-2/`（`eval-<ID>/<with_skill|without_skill>/run-1/outputs/` と採点・タイミング）、trigger は `eval-result/iterations/rikai/iteration-3/trigger/`（逐次は `result.json`、並列の比較は `result-parallel.json`）。`iterations/` は git 管理外

## 最新の結果

### eval・ベンチマーク（2026-10-30、iteration 2）

比較はスキルあり・なし。1 ケース 1 回の実行（`run-1` のみ）。現行の `evals.json`（eval 2〜5 のプロンプト短縮後）で測定。採点は expectations 38 項目を手動で判定。

| eval | 内容 | スキルあり | スキルなし |
|------|------|-----------|-----------|
| 1 | 起動と同じ発言の依頼 | 8/8 | 2/8 |
| 2 | クイズへの返答（一部理解） | 9/9 | 6/9 |
| 3 | 詳細を詰める型の質問 | 7/7 | 3/7 |
| 4 | 問いに答えず別の話題へ移る | 8/8 | 4/8 |
| 5 | クイズが残る状態での終了 | 6/6 | 4/6 |
| 合計 | | **38/38（100%）** | **19/38（50%）** |

- ベンチマーク（`benchmark.md`）: 合格率 100% 対 50%（差 +0.50）。所要時間 26.5 秒対 11.4 秒、トークン約 62,300 対 約 45,700（subagent の合計値）。
- スキルなしの主な欠落: 理解度レポートの形式（eval 1・2・4・5）、回答番号（eval 2・3・4）、rikai 有効化の通知（eval 1・4）、判定ラベル「一部理解した」（eval 2）、話題ごとのレポート分割（eval 4）。
- スキルありは全項目合格で、天井効果。改善前後の差を測るには、より厳しいケースが要る。
- 制約: 会話途中の状態は書き起こしで再現。スキルありの実行はファイル保存・`flag.mts`・`.rikai/` を行っていない（「保存しなかった」と明記させた）。セッション持続、バッジは未測定。
- iteration 1（短縮前のプロンプト、スキルなし 53%）との比較は、プロンプトが異なるため直接の比較にならない。

### trigger（2026-10-30、iteration 3）

評価した description は現行のもの。1 クエリ 3 回実行。訓練・検証に分けず、15 件全てを測った。

| 区分 | 発火すべき | 発火すべきでない |
|------|-----------|-----------------|
| 全件（15 件） | 18/18 回（100%）が発火 | 0/27 回（誤発火なし） |

- 精度、再現率ともに 100%。15/15 合格。名指しなしの自然言語（「理解度チェックしながら説明してほしい。」など）も 3/3 で発火した。
- 全件合格で、天井効果。description の改善前後の差を測るには、境界のケースを足す必要がある。
- 計測手順: リポジトリの外のディレクトリ（空の `.claude/` だけを置く）で、skill-creator の `run_eval` を `--num-workers 1` で実行する。

```bash
mkdir -p <空のディレクトリ>/.claude && cd <空のディレクトリ>
PYTHONPATH=<skill-creator のディレクトリ> env -u CLAUDECODE python3 -m scripts.run_eval \
  --eval-set <リポジトリ>/skills/rikai/evals/trigger-evals.json \
  --skill-path <リポジトリ>/skills/rikai \
  --runs-per-query 3 --num-workers 1 --timeout 90
```

#### iteration 1 の低い発火率は計測の欠陥

iteration 1（2026-10-29）の再現率 8〜17% は、スキルではなく計測の欠陥による。`run_eval` は、偽コマンド `rikai-skill-<uuid>` を `.claude/commands/` に置き、`Skill` か `Read` の入力にその名前が出たときだけ発火と数える。

- **リポジトリの中で実行した**: モデルが `skills/rikai/SKILL.md` を直接 Read し、スキルを使っていた。パスに偽コマンド名が無いので、発火なしと数えられた。
- **並列で実行した**（`--num-workers 10`）: 各 worker が同じディレクトリに、同じ description の偽コマンドを置く。モデルが他の worker の偽コマンドを選ぶと、発火なしと数えられる。リポジトリの外でも並列のままでは、発火すべき発話の発火は 2/18 回だった（`result-parallel.json`）。
- 2 反復目の description の書き換えが改善しなかったのも、同じ欠陥のためで、description の良し悪しは測れていない。

## 改善案（未反映）

反映は `create-skill` 側で、人が承認して行う。

1. **発火精度の仕様の根拠（優先度: 中）**: iteration 3 では名指しなしの自然言語（「クイズで確かめてくれるモードにして」「理解度チェックしながら説明してほしい」）も発火した。ただし、仕様にも description にも、これらで起動する根拠が無い。発火を仕様として認めるなら、`openspec/specs/rikai-session-mode` の起動の定義を直す。認めないなら、trigger の期待値を見直す。iteration 1 の「発火しない」という前提は計測の欠陥によるもので、description の書き換えは不要。
2. **仕様の食い違い**: 起動の次のターンの回答番号が 1 になる根拠が、`rikai-session-mode`（「次の回答を 1 とする」）と `rikai-question-selection`（数える条件）で食い違う。今回は、起動と依頼を同じ発言にして回避した。仕様の修正は、別 issue か OpenSpec で扱う。
3. **eval の強化**: ケースを厳しくする（複数ターン、二重起動、話題への復帰、ファイル保存）。弱い期待値を直す。eval 1 の期待値 6 はスキルなしでも自明に通る。eval 4 の期待値 4 は 2 条件が混在している。eval 5 に「終了した旨の一言」の確認がない。eval 3 に、質問提案かクイズかの種別を確かめる項目がない。

## 履歴

| 日付 | iteration | 種類 | 主要数値 | effort | 備考 |
|------|-----------|------|----------|--------|------|
| 2026-10-29 | 1 | eval | 合格率 100%（スキルなしは 53%） | 不明 | 短縮前のプロンプト。判定 PASS |
| 2026-10-29 | 1 | trigger | 発火率 8〜17%（誤発火 0%） | 不明 | ループは 3 反復目で異常終了 |
| 2026-10-30 | 2 | eval | 合格率 100%（スキルなしは 50%） | lower（subagent） | 現行 evals.json。採点は手動。判定 PASS |
| 2026-10-30 | 3 | trigger | 発火率 100%（誤発火 0%）、15/15 合格 | 不明 | リポジトリの外で逐次実行。iteration 1 の低い発火率は計測の欠陥と判明 |
