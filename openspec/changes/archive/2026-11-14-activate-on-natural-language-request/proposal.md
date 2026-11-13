## Why

対象 issue: #18（Closes #18）。

rikai を名指ししない自然言語の依頼（「理解度チェックしながら説明してほしい。」など）でも、trigger 評価では 3/3 で発火した（`eval-result/rikai.md` の iteration 3）。`trigger-evals.json` もこれを `should_trigger: true` としている。一方、`rikai-session-mode` の「起動と終了の指示を受け付ける」が挙げる起動の指示は、`/rikai` と「rikaiを始めて」だけである。仕様と評価の期待値が食い違ったままでは、発火が正しいのか誤発火なのか判定できず、description を変えたときの良し悪しも評価できない。ユーザーは名指しなしの依頼での起動を認めると決めた。

## What Changes

- 名指しなしの起動を認める。起動するのは、ユーザー自身がこれからの回答ごとに理解度を確かめることを求める発話とする。一回きりのクイズ作成や診断、別の目的の一問一答（面接練習など）、rikai を話題や開発の対象にした発話、通常の解説の依頼では起動しない。
- 継続的な確認か一回きりかを判断できない発話には、起動するかを尋ねる1行だけを返す。依頼は返事を受けてから処理する。肯定なら起動して、保留した依頼を起動と同じ発言の依頼として扱い、否定なら起動せずに保留した依頼を通常どおり処理する。
- 名指しなしの終了も認める。モード有効中に、ユーザー自身が回答ごとの問いとレポートの停止を求める発話（「もうクイズはいらない」など）は、終了として扱う。今の問い1問だけを断る発話は、終了ではない。終了か判断できない発話では終了せず、モードを続ける。
- `skills/rikai/SKILL.md` の description、冒頭、第6節を上の決定に合わせる。`README.md` と `README.en.md` の起動と終了の説明も合わせる。
- 評価データを足す。`trigger-evals.json` に判断できない起動のケースを、`evals.json` に名指しなしの起動、判断できない起動、名指しなしの終了、今の問いだけを断る発言、起動の確認への肯定のケースを足す。trigger と追加した eval を測り、`eval-result/rikai.md` に残す。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `rikai-session-mode`: 「起動と終了の指示を受け付ける」に、名指しなしの起動と終了の条件、起動と終了に当たらない発話、判断できないときの扱いを加え、シナリオを足す。

## Impact

- 変更: `skills/rikai/SKILL.md`、`README.md`、`README.en.md`、`skills/rikai/evals/trigger-evals.json`、`skills/rikai/evals/evals.json`、`skills/rikai/evals/README.md`、`eval-result/rikai.md`、`openspec/specs/rikai-session-mode/spec.md`（アーカイブ時に反映）。
- スクリプトとテストは変えない。
- 利用者への影響: rikai の名前を知らなくても、「理解度を確かめながら説明して」のように頼めば起動する。判断できない依頼には、起動するかの確認が1行入る。モード有効中に「もうクイズはいらない」と言うと、終了して最終レポートが出る。
