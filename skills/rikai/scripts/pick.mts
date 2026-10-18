const SUGGESTION_THRESHOLD = 0.5;
const FAILURE_EXIT_CODE = 1;
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;
const SUGGESTION_OUTPUT = "suggestion";
const QUIZ_OUTPUT = "quiz";

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

try {
  const random = parseRandom(process.argv.slice(2));
  process.stdout.write(
    `${random >= SUGGESTION_THRESHOLD ? SUGGESTION_OUTPUT : QUIZ_OUTPUT}\n`,
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(FAILURE_EXIT_CODE);
}
