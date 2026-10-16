import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const SCRIPT_PATH = resolve(
  import.meta.dirname,
  "../skills/rikai/scripts/pick.mts",
);
const SUGGESTION_THRESHOLD = "0.5";
const JUST_BELOW_THRESHOLD = "0.4999";
const LOWER_BOUND = "0";
const JUST_BELOW_UPPER_BOUND = "0.9999";
const SUCCESS_EXIT_CODE = 0;
const FAILURE_EXIT_CODE = 1;
const SUGGESTION_OUTPUT = "suggestion\n";
const QUIZ_OUTPUT = "quiz\n";
const MODULE_NOT_FOUND_MESSAGES = [
  "Cannot find module",
  "ERR_MODULE_NOT_FOUND",
];

const runPick = (args: string[]) => {
  const result = spawnSync("node", [SCRIPT_PATH, ...args], {
    encoding: "utf8",
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
};

describe("pick", () => {
  test.each([
    {
      name: "0.5 (境界) は suggestion",
      value: SUGGESTION_THRESHOLD,
      expected: SUGGESTION_OUTPUT,
    },
    {
      name: "0.9999 は suggestion",
      value: JUST_BELOW_UPPER_BOUND,
      expected: SUGGESTION_OUTPUT,
    },
    {
      name: "0.4999 は quiz",
      value: JUST_BELOW_THRESHOLD,
      expected: QUIZ_OUTPUT,
    },
    { name: "0 は quiz", value: LOWER_BOUND, expected: QUIZ_OUTPUT },
  ])("$name", ({ value, expected }) => {
    const result = runPick([value]);

    expect(result).toStrictEqual({
      status: SUCCESS_EXIT_CODE,
      stdout: expected,
      stderr: "",
    });
  });

  test("引数を省略すると suggestion か quiz のどちらかを出力する", () => {
    const result = runPick([]);

    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect([SUGGESTION_OUTPUT, QUIZ_OUTPUT]).toContain(result.stdout);
    expect(result.stderr).toBe("");
  });

  test.each([
    { name: "数値でない (abc)", args: ["abc"] },
    { name: "NaN", args: ["NaN"] },
    { name: "負数 (-0.1)", args: ["-0.1"] },
    { name: "1 (上限を含まない)", args: ["1"] },
    { name: "範囲外 (1.5)", args: ["1.5"] },
    { name: "空文字", args: [""] },
    { name: "引数が 2 個", args: ["0.1", "0.2"] },
  ])("不正な引数 $name はエラー終了する", ({ args }) => {
    const result = runPick(args);

    expect(result.status).toBe(FAILURE_EXIT_CODE);
    expect(result.stdout).toBe("");
    expect(result.stderr.trim()).not.toBe("");
    for (const message of MODULE_NOT_FOUND_MESSAGES) {
      expect(result.stderr).not.toContain(message);
    }
  });
});
