import { describe, expect, test } from "vitest";
import {
  parseRandomArgs,
  selectOutput,
} from "../../skills/rikai/scripts/utils/randomPick.mts";

describe("parseRandomArgs", () => {
  describe("正常系", () => {
    test("引数が無ければ undefined を返す", () => {
      // Arrange

      // Act
      const result = parseRandomArgs([]);

      // Assert
      expect(result).toBeUndefined();
    });

    test.each([
      { raw: "0", expected: 0 },
      { raw: "0.5", expected: 0.5 },
      { raw: "0.999", expected: 0.999 },
    ])("$raw は数値として返す", ({ raw, expected }) => {
      // Arrange

      // Act
      const result = parseRandomArgs([raw]);

      // Assert
      expect(result).toBe(expected);
    });
  });

  describe("異常系", () => {
    test("引数が2個以上なら拒否する", () => {
      // Arrange

      // Act
      const act = () => parseRandomArgs(["0.1", "0.2"]);

      // Assert
      expect(act).toThrow("乱数1個まで");
    });

    test.each(["1", "1.5", "-0.1", "abc", "", "0.", ".5", "1e-1"])(
      '"%s" は 0 以上 1 未満の小数でないとして拒否する',
      (raw) => {
        // Arrange

        // Act
        const act = () => parseRandomArgs([raw]);

        // Assert
        expect(act).toThrow("0 以上 1 未満の小数");
      },
    );
  });
});

describe("selectOutput", () => {
  describe("正常系", () => {
    test.each([
      { random: 0.5, expected: "suggestion" },
      { random: 0.999, expected: "suggestion" },
      { random: 0.4999, expected: "quiz" },
      { random: 0, expected: "quiz" },
    ])("乱数 $random は $expected を返す", ({ random, expected }) => {
      // Arrange

      // Act
      const result = selectOutput(random);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
