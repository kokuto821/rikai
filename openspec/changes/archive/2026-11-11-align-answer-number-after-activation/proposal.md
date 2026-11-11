## Why

対象 issue: #21（Closes #21）。

起動だけの発言の次のターンで、回答番号が 1 になるかどうかが、`rikai-session-mode` と `rikai-question-selection` で食い違っている。前者は起動の応答の「次の回答を 1 とする」とし、後者は起動と同じ発言の依頼を除き、返答・仮説・詳細を詰める型の質問を含むターンだけを数える。`/rikai` だけを送り、次に依頼だけを送ると、前者では 1 になり、後者では数えない。後者のときは、数えた回答がまだ無いので、レポートの `回答番号` に書く値も決まらない。#17 の評価（`eval-result/rikai.md` の改善案2）で見つかり、評価では起動と依頼を同じ発言にして回避した。

## What Changes

- 回答番号の例外を一般化する。新しく起動した後、数えた回答がまだ無ければ、次の回答は条件によらず数え、回答番号を 1 にする。起動と同じ発言の依頼、起動の次の発言の依頼、最初の回答より前の二重起動の発言に含まれる依頼を、すべてこの規則で扱う。
- 「判定に迷ったら数えなくてよい」は、この規則には当てはめない。
- 数えた回答が無いまま終了したときは、判定結果もレポートも出さず、終了した旨の1行だけを出す。これで、数えた回答が無いのにレポートを出す場面が無くなり、`回答番号` の値を別に決めなくてよい。
- `skills/rikai/SKILL.md` を上の決定に合わせる。
- evals に、起動と依頼を別の発言にしたケースを足し、測定結果を `eval-result/rikai.md` に残す。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `rikai-session-mode`: 「起動の応答は有効化の通知と形式の提案だけにする」の、次の回答を 1 とする記述を、一般化した規則に合わせる。「1ターンを一定の流れで処理する」の図の、数えるかの分岐を同じ規則に合わせる。「全ての回答に問いとレポートを付ける」と「セッション持続モードで動作する」に、数えた回答が無いまま終了したときの応答を加える。
- `rikai-question-selection`: 「質問提案とクイズの別と回答番号を決める」の例外を、数えた回答がまだ無いときの規則に一般化し、シナリオを足す。
- `rikai-understanding-report`: 「レポートの雛形」と「ファイルに保存している間はチャットにレポートを出さない」の終了の応答の記述に、数えた回答が無いまま終了したときの例外を加える。

## Impact

- 変更: `skills/rikai/SKILL.md`、`skills/rikai/evals/evals.json`、`skills/rikai/evals/README.md`、`eval-result/rikai.md`、`openspec/specs/rikai-session-mode/spec.md`・`openspec/specs/rikai-question-selection/spec.md`・`openspec/specs/rikai-understanding-report/spec.md`（アーカイブ時に反映）。
- スクリプトとテストは変えない（回答番号は `pick.mts` の入力に使わないため）。
- 利用者への影響: `/rikai` だけを送ったあとの最初の回答に、回答番号 1 のレポートが付く。起動と依頼を同じ発言にした場合の出力は変わらない。
