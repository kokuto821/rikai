const SUGGESTION_THRESHOLD = 0.5;
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;
const SUGGESTION_OUTPUT = "suggestion";
const QUIZ_OUTPUT = "quiz";

/**
 * コマンドライン引数から乱数を取り出す。
 *
 * @param args - 乱数を1個まで含む引数
 * @returns 0 以上 1 未満の乱数。引数が無ければ `undefined`
 * @throws 引数が2個以上、または 0 以上 1 未満の小数でないとき
 */
export const parseRandomArgs = (args: string[]): number | undefined => {
  if (args.length > 1) {
    throw new Error("引数は乱数1個までです。");
  }
  const raw = args[0];
  if (raw === undefined) {
    return undefined;
  }
  const value = Number(raw);
  if (!DECIMAL_PATTERN.test(raw) || value >= 1) {
    throw new Error(`乱数は 0 以上 1 未満の小数で指定してください: "${raw}"`);
  }
  return value;
};

/**
 * 乱数から、質問の提案とクイズのどちらを出すかを選ぶ。
 *
 * @param random - 0 以上 1 未満の乱数
 * @returns 0.5 以上なら `suggestion`、未満なら `quiz`
 */
export const selectOutput = (random: number): string =>
  random >= SUGGESTION_THRESHOLD ? SUGGESTION_OUTPUT : QUIZ_OUTPUT;
