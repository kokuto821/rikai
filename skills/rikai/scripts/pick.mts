import { runCli } from "./cli.mts";
import { parseRandomArgs, selectOutput } from "./utils/randomPick.mts";

/**
 * 質問の提案とクイズのどちらを出すかを、乱数で機械的に選んで標準出力に出す。
 * 乱数は引数で注入でき、無ければ `Math.random()` を使う。
 *
 * 使い方: `node pick.mts [乱数]`
 *
 * 出力は `suggestion` か `quiz` の1行。乱数が 0.5 以上なら `suggestion`。
 * 乱数が 0 以上 1 未満の小数でない、または引数が2個以上なら、
 * 標準エラーにメッセージを出して終了コード 1 で終わる。
 */
runCli(() => {
  const random = parseRandomArgs(process.argv.slice(2)) ?? Math.random();
  return `${selectOutput(random)}\n`;
});
