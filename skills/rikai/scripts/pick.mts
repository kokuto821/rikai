import { runCli } from "./cli.mts";

const SUGGESTION_THRESHOLD = 0.5;
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;
const SUGGESTION_OUTPUT = "suggestion";
const QUIZ_OUTPUT = "quiz";

/**
 * コマンドライン引数から乱数を決める。引数が無ければ `Math.random()` を使う。
 *
 * @param args - 乱数を1個まで含む引数
 * @returns 0 以上 1 未満の乱数
 * @throws 引数が2個以上、または 0 以上 1 未満の小数でないとき
 */
const parseRandom = (args: string[]): number => {
  if (args.length > 1) {
    throw new Error("引数は乱数1個までです。");
  }
  const raw = args[0];
  if (raw === undefined) {
    return Math.random();
  }
  const value = Number(raw);
  if (!DECIMAL_PATTERN.test(raw) || value >= 1) {
    throw new Error(`乱数は 0 以上 1 未満の小数で指定してください: "${raw}"`);
  }
  return value;
};

runCli(() => {
  const random = parseRandom(process.argv.slice(2));
  return `${random >= SUGGESTION_THRESHOLD ? SUGGESTION_OUTPUT : QUIZ_OUTPUT}\n`;
});
