import { describe, expect, test } from "vitest";
import { buildSnippet } from "../../skills/rikai/scripts/utils/snippet.mts";

const COPY_PATH = "/home/user/.claude/rikai/statusline.mts";
const SPACED_COPY_PATH = "/home/user/config dir/rikai/statusline.mts";

const extractJson = (text: string): unknown => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  return JSON.parse(text.slice(firstBrace, lastBrace + 1));
};

describe("buildSnippet", () => {
  describe("正常系", () => {
    test("statusLine のコマンドにコピー先のパスを引用符で囲んで入れる", () => {
      // Arrange

      // Act
      const result = buildSnippet(COPY_PATH);

      // Assert
      expect(extractJson(result)).toStrictEqual({
        statusLine: { type: "command", command: `node "${COPY_PATH}"` },
      });
    });

    test("パスに空白を含んでも、引用符で囲んだコマンドになる", () => {
      // Arrange

      // Act
      const result = buildSnippet(SPACED_COPY_PATH);

      // Assert
      expect(extractJson(result)).toStrictEqual({
        statusLine: {
          type: "command",
          command: `node "${SPACED_COPY_PATH}"`,
        },
      });
    });

    test("JSON の前後に案内文を付ける", () => {
      // Arrange

      // Act
      const result = buildSnippet(COPY_PATH);

      // Assert
      const firstBrace = result.indexOf("{");
      const lastBrace = result.lastIndexOf("}");
      expect(result.slice(0, firstBrace).trim()).not.toBe("");
      expect(result.slice(lastBrace + 1).trim()).not.toBe("");
    });
  });
});
