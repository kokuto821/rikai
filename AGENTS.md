# Dev Rule

## Branch Strategy
Trunk Based Developmentを採用する

## Version Management
SemVerを採用する

## Issue Management
issueを発行：github-issue-create
課題解決：Agent Skills Dev Workflowにて実行
コード修正はissue経由のみを原則とする。

## Agent Skills Dev Workflow
issue駆動開発を採用。詳細は「matagi/github-issue-resolve」。

例外として、スキルを作成・レビューする際は以下のスキルにゆだねる。
スクリプトの開発はTDDで実装する。

スキル作成・修正：matagi-kaji/create-skill
レビュー：matagi-kaji/ai-engineering-review（レビューが通るまで3から繰り返し）
