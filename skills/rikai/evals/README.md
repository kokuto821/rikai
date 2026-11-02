# rikai 評価ケース

別エージェントが起草し、別のエージェントが仕様の本文と照らして見直した。SKILL.md の実装ではなく、README.md と `openspec/specs/` から期待挙動を導いた。

- `evals.json`: 起動後の振る舞いを1ターンで測るケース5件（起動と依頼、クイズへの返答、詳細を詰める質問、話題の切り替え、終了）。skill-creator の schemas.md の形式（`skill_name` / `evals[].id, prompt, expected_output, files, expectations`）。セッション途中の状態は、prompt 内に会話の要約として埋め込む。
- `trigger-evals.json`: description 最適化用。`{query, should_trigger}` の配列で、true 6件・false 9件。false には、近接ケース（rikai自体の開発、一回きりのクイズ作成、面接練習、eval作成の依頼）を含める。

## 1ターンで測れない性質（evals.json では未検証）

- セッション持続（会話圧縮や `/clear` での失効、終了後の無出力）
- pick.mts の乱数による質問提案とクイズの別、連続2回失敗の代替ロジック（通常チャットの交互ルールは複数ターン要る）
- 話題への復帰（既存レポートの再開）、`.rikai/` のファイル保存と `.gitignore` 作成（ファイル書き込み環境が要る）
- バッジ表示（statusline）、flag.mts の書き換え
- 判定の正誤そのもの（AIの解釈との一致度は主観が入る）
