const SUGGESTION_THRESHOLD = 0.5;
const MAX_ARGUMENT_COUNT = 1;
const FAILURE_EXIT_CODE = 1;
const DECIMAL_PATTERN = /^\d+(\.\d+)?$/;

const parseRandom = (args: string[]): number => {
  if (args.length > MAX_ARGUMENT_COUNT) {
    throw new Error("引数は乱数1個までです。");
  }
  if (args.length === 0) {
    return Math.random();
  }
  const raw = args[0] ?? "";
  if (!DECIMAL_PATTERN.test(raw)) {
    throw new Error(`乱数は 0 以上 1 未満の小数で指定してください: "${raw}"`);
  }
  const value = Number(raw);
  if (!(value >= 0 && value < 1)) {
    throw new Error(`乱数は 0 以上 1 未満で指定してください: "${raw}"`);
  }
  return value;
};

try {
  const random = parseRandom(process.argv.slice(2));
  process.stdout.write(
    random >= SUGGESTION_THRESHOLD ? "suggestion\n" : "quiz\n",
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(FAILURE_EXIT_CODE);
}
