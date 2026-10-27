<!-- matagi: 対象 issue 番号（Closes #<番号>）を冒頭の Why に明記する。issue の粒度・ブランチ運用は matagi の issue-driven-rule（shared-rules/issue-driven-development/issue-driven-rule.md）に従う。進行は matagi:openspec-workflow スキル経由で行う。 -->

## Why

対象 issue: #6。

理解の進捗は個人のものである。レポートには会話の内容も含まれうるので、他人が書き換えられる場所や、共有される履歴に残すべきではない。今の仕様は、`.rikai/` を git で追跡するか除外するかをユーザーが決められるとして、初回保存のたびに1行で案内する。リポジトリ直下の `.gitignore` は自動編集しないので、ユーザーが自分で除外を設定しない限り、レポートが追跡の対象のまま残る。既定は「除外」の方が安全である。

`.rikai/` の中に `.gitignore`（中身は `*`）を置く方式なら、`.rikai/` が自分自身を除外できる。リポジトリ直下の `.gitignore` を編集しない方針とも両立する。

## What Changes

- レポートを初めて保存するとき、`.rikai/` を作ると同時に `.rikai/.gitignore`（中身は `*` の1行）を作る。
- `.rikai/` か `.rikai/.gitignore` がすでにあれば、何もしない。上書きも作り直しもしない。ユーザーが消した場合も作り直さない。
- 作ったときは、1行で通知する。通知の文言は、`.rikai/.gitignore` を作ったこと、レポートが git の対象外になったこと、追跡したいときはこのファイルを削除すればよいことを含む。
- 追跡したいユーザーは、`.rikai/.gitignore` を削除すればよい。
- 「追跡するか除外するかをユーザーが決められる旨を、初回保存時に1行で案内する」という記述は、仕様から整理する。上の通知が、その役割を引き継ぐ。
- リポジトリ直下の `.gitignore` は、これまでどおり編集しない。
- 仕様と `SKILL.md` にある「`.gitignore`」の表記は、リポジトリ直下のものと取り違えないよう、`.rikai/.gitignore` と明記する。
- `.rikai/` の作成先は、cwd 直下とする。現行の仕様は相対パスで書いていて、起点が明記されていなかった。
- フラグと `statusline.mts` の置き場（`${CLAUDE_CONFIG_DIR:-~/.claude}/rikai/`）と、`flag.mts install` の挙動は変えない。設定ファイルは作らない。設定項目が出たときに、同じ `.rikai/` に追加する。

## Capabilities

### New Capabilities

なし。

### Modified Capabilities

- `rikai-understanding-report`: 要件「ファイル保存時に .gitignore を自動編集しない」を、`.rikai/.gitignore` の自動作成と通知の要件に置き換える。「保存先の案内」の定義が指す1行の呼び名と、`.rikai/` の作成先（cwd）も直す
- `rikai-session-mode`: 付随の通知の1つである「`.gitignore` の案内」を、`.rikai/.gitignore` の作成の通知に直す

## Impact

- `skills/rikai/SKILL.md`: 第1節の0（付随の通知）、第5節（レポート保存の手順）
- `openspec/specs/rikai-understanding-report/spec.md`: 要件「ファイル保存時に .gitignore を自動編集しない」、要件「ファイルに保存している間はチャットにレポートを出さない」の注記
- `openspec/specs/rikai-session-mode/spec.md`: 要件の付随の通知と、対応するシナリオ
- スクリプト（`.mts`）、テスト、README への影響はない（README に `.gitignore` の記述はない）
