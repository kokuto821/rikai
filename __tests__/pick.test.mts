import { afterEach, describe, expect, test } from "vitest";
import {
  buildRejectedResult,
  cleanupTempDirs,
  createPickResult,
  SUCCESS_EXIT_CODE,
} from "./helpers/scriptTestHelpers.mts";

afterEach(cleanupTempDirs);

const SUGGESTION_OUTPUT = "suggestion\n";
const QUIZ_OUTPUT = "quiz\n";
const HIGH_RANDOM = "0.9";
const LOW_RANDOM = "0.1";
const COUNT_REASON = "1個までです";
const RANGE_REASON = "0 以上 1 未満";

// pick.mts は別プロセスとして spawnSync で起動するため、同一プロセス内でしか
// 効かない vi.spyOn(Math, "random") は使えない。Node 18.18+（本リポジトリは
// package.json の engines で Node 22.18 以上を要求）がサポートする
// --import の data: URL で、子プロセス起動前に Math.random を固定値へ差し替える。
const buildFixedRandomNodeArgs = (value: string): string[] => [
  "--import",
  `data:text/javascript,Math.random%3D()%3D%3E${value}`,
];

const buildSuccessResult = (stdout: string) => ({
  status: SUCCESS_EXIT_CODE,
  stdout,
  stderr: "",
});

describe("pick", () => {
  describe("正常系", () => {
    test.each([
      {
        name: "0.5 (境界) は suggestion",
        value: "0.5",
        expected: SUGGESTION_OUTPUT,
      },
      {
        name: "0.9999 は suggestion",
        value: "0.9999",
        expected: SUGGESTION_OUTPUT,
      },
      {
        name: "0.9999999999999999 (1 の直前) は suggestion",
        value: "0.9999999999999999",
        expected: SUGGESTION_OUTPUT,
      },
      { name: "0.4999 は quiz", value: "0.4999", expected: QUIZ_OUTPUT },
      { name: "0 は quiz", value: "0", expected: QUIZ_OUTPUT },
    ])("$name", ({ value, expected }) => {
      // Arrange
      const args = [value];

      // Act
      const result = createPickResult(args);

      // Assert
      expect(result).toStrictEqual(buildSuccessResult(expected));
    });

    test.each([
      {
        name: "0.9 なら suggestion",
        random: HIGH_RANDOM,
        expected: SUGGESTION_OUTPUT,
      },
      { name: "0.1 なら quiz", random: LOW_RANDOM, expected: QUIZ_OUTPUT },
    ])("引数を省略すると乱数が $name", ({ random, expected }) => {
      // Arrange
      const options = { nodeArgs: buildFixedRandomNodeArgs(random) };

      // Act
      const result = createPickResult([], options);

      // Assert
      expect(result).toStrictEqual(buildSuccessResult(expected));
    });
  });

  describe("異常系", () => {
    test.each([
      { name: "数値でない (abc)", args: ["abc"], reason: RANGE_REASON },
      { name: "NaN", args: ["NaN"], reason: RANGE_REASON },
      { name: "負数 (-0.1)", args: ["-0.1"], reason: RANGE_REASON },
      { name: "1 (上限を含まない)", args: ["1"], reason: RANGE_REASON },
      { name: "1.0 (上限を含まない)", args: ["1.0"], reason: RANGE_REASON },
      { name: "範囲外 (1.5)", args: ["1.5"], reason: RANGE_REASON },
      { name: "空文字", args: [""], reason: RANGE_REASON },
      { name: "整数部の省略 (.5)", args: [".5"], reason: RANGE_REASON },
      { name: "指数表記 (1e-1)", args: ["1e-1"], reason: RANGE_REASON },
      { name: "符号つき (+0.5)", args: ["+0.5"], reason: RANGE_REASON },
      { name: "小数部の省略 (0.)", args: ["0."], reason: RANGE_REASON },
      { name: "負のゼロ (-0)", args: ["-0"], reason: RANGE_REASON },
      { name: "16 進数 (0x1)", args: ["0x1"], reason: RANGE_REASON },
      { name: "Infinity", args: ["Infinity"], reason: RANGE_REASON },
      { name: "前に空白 ( 0.5)", args: [" 0.5"], reason: RANGE_REASON },
      {
        name: "後ろに改行 (0.5 と改行)",
        args: ["0.5\n"],
        reason: RANGE_REASON,
      },
      { name: "引数が 2 個", args: ["0.1", "0.2"], reason: COUNT_REASON },
    ])("不正な引数 $name はエラー終了する", ({ args, reason }) => {
      // Arrange
      const expected = buildRejectedResult(reason);

      // Act
      const result = createPickResult(args);

      // Assert
      expect(result).toStrictEqual(expected);
    });
  });
});
