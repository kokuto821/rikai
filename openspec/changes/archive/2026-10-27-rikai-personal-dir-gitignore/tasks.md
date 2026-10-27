<!-- matagi: 各タスクの実装は matagi:openspec-workflow スキル経由で進め、実装委譲先（matagi:tdd / matagi:coding / matagi:test-coding）をタスクごとに明記する。 -->

コードの変更はなく、対象は md 資産のみ。委譲先の skill は無いので、`matagi:github-issue-resolve` が直接編集する。

## 1. SKILL.md

- [x] 1.1 第5節「形式と保存」で、「初めて保存するときに…と1行で案内する」の項を、`.rikai/.gitignore` の自動作成の手順に置き換える（初めて `.rikai/` を作るとき、cwd 直下に作る。中身は `*`。すでにあれば何もしない。消されても作り直さない。作ったら1行で通知する。直下の `.gitignore` は編集しない）。委譲先: なし（直接編集）
- [x] 1.2 第1節の0で、付随の通知の対象「`.gitignore` の案内」を「`.rikai/.gitignore` を作った通知」に直す。委譲先: なし（直接編集）
- [x] 1.3 `SKILL.md` に他の `.gitignore` の表記が無いか確認する。委譲先: なし（直接編集）

## 2. 仕様

- [x] 2.1 `openspec/specs/rikai-understanding-report/spec.md` の要件「ファイル保存時に .gitignore を自動編集しない」を、delta と同じ内容の「ファイル保存時に .rikai/.gitignore を作って個人領域にする」に置き換える。委譲先: なし（直接編集）
- [x] 2.2 同じ spec の要件「ファイルに保存している間はチャットにレポートを出さない」の注記を、delta と同じ内容にする。委譲先: なし（直接編集）
- [x] 2.3 `openspec/specs/rikai-session-mode/spec.md` の「毎回の出力を一定の順に並べる」の付随の通知とシナリオを、delta と同じ内容にする。委譲先: なし（直接編集）

## 3. 確認

- [x] 3.1 フラグ、`statusline.mts`、`flag.mts install` の記述と、README に変更が無いことを確認する。委譲先: なし（レビューで別エージェントが確認）
