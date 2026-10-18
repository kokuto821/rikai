import { mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import {
  buildActiveDir,
  buildFlagPath,
  CONFIG_DIR_ENV,
  cleanupTempDirs,
  createFlag,
  createStatuslineResult,
  createTempDir,
  DEFAULT_CONFIG_DIR_NAME,
  EMPTY_FLAG_CONTENT,
  SUCCESS_RESULT as HIDDEN_RESULT,
  HOME_ENV,
  INDICATOR,
  OTHER_SESSION_ID,
  OUTSIDE_NAME,
  RIKAI_DIR_NAME,
  SESSION_ID,
  SUCCESS_EXIT_CODE,
} from "./helpers/scriptTestHelpers.mts";

afterEach(cleanupTempDirs);

const DOTTED_NAME = "a.b";
const REAL_TARGET_NAME = "real-target";
const NUMERIC_SESSION_ID = 123;
const ALLOWED_CHARS_SESSION_ID = "Ab_9-z";
const SHOWN_RESULT = {
  status: SUCCESS_EXIT_CODE,
  stdout: INDICATOR,
  stderr: "",
};

const buildInput = (sessionId: unknown): string =>
  JSON.stringify({ session_id: sessionId });

describe("statusline", () => {
  describe("正常系", () => {
    test("フラグがあるセッションでは [理解] だけを改行なしで出力する", () => {
      // Arrange
      const configDir = createTempDir();
      createFlag(configDir, SESSION_ID);

      // Act
      const result = createStatuslineResult(buildInput(SESSION_ID), {
        configDir,
      });

      // Assert
      expect(result).toStrictEqual(SHOWN_RESULT);
    });

    test("英数字・ハイフン・アンダースコアの session_id でも [理解] を出力する", () => {
      // Arrange
      const configDir = createTempDir();
      createFlag(configDir, ALLOWED_CHARS_SESSION_ID);

      // Act
      const result = createStatuslineResult(
        buildInput(ALLOWED_CHARS_SESSION_ID),
        { configDir },
      );

      // Assert
      expect(result).toStrictEqual(SHOWN_RESULT);
    });

    test("session_id 以外のフィールドを含む JSON でも [理解] を出力する", () => {
      // Arrange
      const configDir = createTempDir();
      createFlag(configDir, SESSION_ID);
      const input = JSON.stringify({
        session_id: SESSION_ID,
        model: { id: "m", display_name: "M" },
        workspace: { current_dir: "/work" },
        other: 1,
      });

      // Act
      const result = createStatuslineResult(input, { configDir });

      // Assert
      expect(result).toStrictEqual(SHOWN_RESULT);
    });

    test.each([
      { name: "未設定", configDirEnv: undefined },
      { name: "空文字", configDirEnv: "" },
    ])(
      "CLAUDE_CONFIG_DIR が$nameなら HOME 配下の .claude を使う",
      ({ configDirEnv }) => {
        // Arrange
        const homeDir = createTempDir();
        createFlag(join(homeDir, DEFAULT_CONFIG_DIR_NAME), SESSION_ID);
        const env = { [HOME_ENV]: homeDir, [CONFIG_DIR_ENV]: configDirEnv };

        // Act
        const result = createStatuslineResult(buildInput(SESSION_ID), {
          env,
        });

        // Assert
        expect(result).toStrictEqual(SHOWN_RESULT);
      },
    );
  });

  describe("異常系", () => {
    test("フラグが無ければ何も出さない", () => {
      // Arrange
      const configDir = createTempDir();

      // Act
      const result = createStatuslineResult(buildInput(SESSION_ID), {
        configDir,
      });

      // Assert
      expect(result).toStrictEqual(HIDDEN_RESULT);
    });

    test("別セッションのフラグしか無ければ何も出さない", () => {
      // Arrange
      const configDir = createTempDir();
      createFlag(configDir, OTHER_SESSION_ID);

      // Act
      const result = createStatuslineResult(buildInput(SESSION_ID), {
        configDir,
      });

      // Assert
      expect(result).toStrictEqual(HIDDEN_RESULT);
    });

    test("フラグの位置が空ディレクトリなら何も出さない", () => {
      // Arrange
      const configDir = createTempDir();
      mkdirSync(buildFlagPath(configDir, SESSION_ID), { recursive: true });

      // Act
      const result = createStatuslineResult(buildInput(SESSION_ID), {
        configDir,
      });

      // Assert
      expect(result).toStrictEqual(HIDDEN_RESULT);
    });

    test.each([
      { name: "不正な JSON", stdin: "{not json" },
      { name: "空の標準入力", stdin: "" },
      { name: "session_id の欠落", stdin: JSON.stringify({ other: 1 }) },
      { name: "数値の session_id", stdin: buildInput(NUMERIC_SESSION_ID) },
      { name: "null", stdin: "null" },
      { name: "空配列", stdin: "[]" },
      { name: "文字列", stdin: JSON.stringify(SESSION_ID) },
      { name: "数値", stdin: JSON.stringify(NUMERIC_SESSION_ID) },
    ])("$name では何も出さない", ({ stdin }) => {
      // Arrange
      const configDir = createTempDir();
      createFlag(configDir, SESSION_ID);
      createFlag(configDir, String(NUMERIC_SESSION_ID));

      // Act
      const result = createStatuslineResult(stdin, { configDir });

      // Assert
      expect(result).toStrictEqual(HIDDEN_RESULT);
    });

    test.each([
      {
        name: "../x (親ディレクトリへの脱出)",
        sessionId: `../${OUTSIDE_NAME}`,
      },
      { name: "a/b (パス区切り)", sessionId: "a/b" },
      { name: "a.b (ドット)", sessionId: DOTTED_NAME },
      { name: "空文字", sessionId: "" },
      { name: "空白を含む", sessionId: "a b" },
      { name: "末尾の改行", sessionId: "abc\n" },
      { name: "非 ASCII", sessionId: "あ" },
    ])(
      "session_id が不正な文字を含む ($name) と何も出さない",
      ({ sessionId }) => {
        // Arrange
        const configDir = createTempDir();
        const activeDir = buildActiveDir(configDir);
        createFlag(configDir, DOTTED_NAME);
        writeFileSync(join(activeDir, "..", OUTSIDE_NAME), EMPTY_FLAG_CONTENT);
        mkdirSync(join(activeDir, "a"), { recursive: true });
        writeFileSync(join(activeDir, "a", "b"), EMPTY_FLAG_CONTENT);

        // Act
        const result = createStatuslineResult(buildInput(sessionId), {
          configDir,
        });

        // Assert
        expect(result).toStrictEqual(HIDDEN_RESULT);
      },
    );

    test("フラグが symlink なら何も出さない", () => {
      // Arrange
      const configDir = createTempDir();
      mkdirSync(buildActiveDir(configDir), { recursive: true });
      const targetPath = join(configDir, REAL_TARGET_NAME);
      writeFileSync(targetPath, EMPTY_FLAG_CONTENT);
      symlinkSync(targetPath, buildFlagPath(configDir, SESSION_ID));

      // Act
      const result = createStatuslineResult(buildInput(SESSION_ID), {
        configDir,
      });

      // Assert
      expect(result).toStrictEqual(HIDDEN_RESULT);
    });

    test("active/ が symlink なら何も出さない", () => {
      // Arrange
      const configDir = createTempDir();
      const realActiveDir = join(configDir, REAL_TARGET_NAME);
      mkdirSync(realActiveDir, { recursive: true });
      writeFileSync(join(realActiveDir, SESSION_ID), EMPTY_FLAG_CONTENT);
      mkdirSync(join(configDir, RIKAI_DIR_NAME), { recursive: true });
      symlinkSync(realActiveDir, buildActiveDir(configDir));

      // Act
      const result = createStatuslineResult(buildInput(SESSION_ID), {
        configDir,
      });

      // Assert
      expect(result).toStrictEqual(HIDDEN_RESULT);
    });

    test("rikai/ が symlink なら何も出さない", () => {
      // Arrange
      const configDir = createTempDir();
      const realBaseDir = join(configDir, REAL_TARGET_NAME);
      createFlag(realBaseDir, SESSION_ID);
      symlinkSync(
        join(realBaseDir, RIKAI_DIR_NAME),
        join(configDir, RIKAI_DIR_NAME),
      );

      // Act
      const result = createStatuslineResult(buildInput(SESSION_ID), {
        configDir,
      });

      // Assert
      expect(result).toStrictEqual(HIDDEN_RESULT);
    });
  });
});
