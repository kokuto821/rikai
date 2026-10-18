import { describe, expect, test } from "vitest";
import {
  buildRejectedResult,
  createPickResult,
  SUCCESS_EXIT_CODE,
} from "./helpers/scriptTestHelpers.mts";

const SUGGESTION_OUTPUT = "suggestion\n";
const QUIZ_OUTPUT = "quiz\n";
const HIGH_RANDOM = "0.9";
const LOW_RANDOM = "0.1";

// Math.random を固定値に差し替える --import 用の data: URL。
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

  test.each([
    { name: "数値でない (abc)", args: ["abc"] },
    { name: "NaN", args: ["NaN"] },
    { name: "負数 (-0.1)", args: ["-0.1"] },
    { name: "1 (上限を含まない)", args: ["1"] },
    { name: "1.0 (上限を含まない)", args: ["1.0"] },
    { name: "範囲外 (1.5)", args: ["1.5"] },
    { name: "空文字", args: [""] },
    { name: "整数部の省略 (.5)", args: [".5"] },
    { name: "指数表記 (1e-1)", args: ["1e-1"] },
    { name: "符号つき (+0.5)", args: ["+0.5"] },
    { name: "小数部の省略 (0.)", args: ["0."] },
    { name: "負のゼロ (-0)", args: ["-0"] },
    { name: "16 進数 (0x1)", args: ["0x1"] },
    { name: "Infinity", args: ["Infinity"] },
    { name: "前に空白 ( 0.5)", args: [" 0.5"] },
    { name: "後ろに改行 (0.5 と改行)", args: ["0.5\n"] },
    { name: "引数が 2 個", args: ["0.1", "0.2"] },
  ])("不正な引数 $name はエラー終了する", ({ args }) => {
    // Arrange
    const expected = buildRejectedResult();

    // Act
    const result = createPickResult(args);

    // Assert
    expect(result).toStrictEqual(expected);
  });
});
