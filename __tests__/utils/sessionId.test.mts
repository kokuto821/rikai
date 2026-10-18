import { describe, expect, test } from "vitest";
import { parseSessionId } from "../../skills/rikai/scripts/utils/sessionId.mts";

const ALLOWED_CHARS_SESSION_ID = "Ab_9-z";

describe("parseSessionId", () => {
  describe("正常系", () => {
    test("英数字・ハイフン・アンダースコアの session_id をそのまま返す", () => {
      // Arrange
      const raw = ALLOWED_CHARS_SESSION_ID;

      // Act
      const result = parseSessionId(raw);

      // Assert
      expect(result).toBe(raw);
    });
  });

  describe("異常系", () => {
    test.each([
      { label: "未指定", raw: undefined },
      { label: "空文字", raw: "" },
      { label: "親ディレクトリへの脱出", raw: "../x" },
      { label: "パス区切り", raw: "a/b" },
      { label: "ドット", raw: "a.b" },
      { label: "空白を含む", raw: "a b" },
      { label: "末尾の改行", raw: "abc\n" },
      { label: "非 ASCII", raw: "あ" },
    ])("$label は session_id のエラーで拒否する", ({ raw }) => {
      // Arrange

      // Act
      const act = () => parseSessionId(raw);

      // Assert
      expect(act).toThrow("session_id");
    });
  });
});
