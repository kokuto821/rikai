import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import {
  buildActiveDir,
  buildFlagPath,
  buildRejectedResult,
  buildRikaiDir,
  CONFIG_DIR_ENV,
  cleanupTempDirs,
  createFlag,
  createFlagResult,
  createTempDir,
  DEFAULT_CONFIG_DIR_NAME,
  EMPTY_FLAG_CONTENT,
  HOME_ENV,
  OTHER_SESSION_ID,
  OUTSIDE_NAME,
  SESSION_ID,
  SESSION_ID_REASON,
  SUCCESS_RESULT,
} from "./helpers/scriptTestHelpers.mts";

afterEach(cleanupTempDirs);

const OUTSIDE_CONTENT = "outside-content";
const SUBCOMMAND_REASON = "使い方";
const ALLOWED_CHARS_SESSION_ID = "Ab_9-z";

describe("flag on/off", () => {
  describe("正常系", () => {
    test("on はディレクトリを作って空のフラグファイルを作る", () => {
      // Arrange
      const configDir = createTempDir();

      // Act
      const result = createFlagResult(["on", SESSION_ID], { configDir });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(readFileSync(buildFlagPath(configDir, SESSION_ID), "utf8")).toBe(
        EMPTY_FLAG_CONTENT,
      );
      expect(readdirSync(buildActiveDir(configDir))).toStrictEqual([
        SESSION_ID,
      ]);
    });

    test("on は英数字・ハイフン・アンダースコアの session_id を受け付ける", () => {
      // Arrange
      const configDir = createTempDir();

      // Act
      const result = createFlagResult(["on", ALLOWED_CHARS_SESSION_ID], {
        configDir,
      });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(
        existsSync(buildFlagPath(configDir, ALLOWED_CHARS_SESSION_ID)),
      ).toBe(true);
    });

    test("off は英数字・ハイフン・アンダースコアの session_id を受け付ける", () => {
      // Arrange
      const configDir = createTempDir();
      createFlag(configDir, ALLOWED_CHARS_SESSION_ID);

      // Act
      const result = createFlagResult(["off", ALLOWED_CHARS_SESSION_ID], {
        configDir,
      });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(
        existsSync(buildFlagPath(configDir, ALLOWED_CHARS_SESSION_ID)),
      ).toBe(false);
    });

    test("on は 2 回実行しても成功し、フラグが 1 つだけ残る", () => {
      // Arrange
      const configDir = createTempDir();
      createFlagResult(["on", SESSION_ID], { configDir });

      // Act
      const result = createFlagResult(["on", SESSION_ID], { configDir });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(readdirSync(buildActiveDir(configDir))).toStrictEqual([
        SESSION_ID,
      ]);
    });

    test("on は他のセッションのフラグを残す", () => {
      // Arrange
      const configDir = createTempDir();
      createFlag(configDir, OTHER_SESSION_ID);

      // Act
      const result = createFlagResult(["on", SESSION_ID], { configDir });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(readdirSync(buildActiveDir(configDir)).sort()).toStrictEqual(
        [OTHER_SESSION_ID, SESSION_ID].sort(),
      );
    });

    test("off はフラグファイルを削除する", () => {
      // Arrange
      const configDir = createTempDir();
      const flagPath = createFlag(configDir, SESSION_ID);

      // Act
      const result = createFlagResult(["off", SESSION_ID], { configDir });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(existsSync(flagPath)).toBe(false);
    });

    test("off はフラグが無くても成功する", () => {
      // Arrange
      const configDir = createTempDir();
      createFlag(configDir, OTHER_SESSION_ID);

      // Act
      const result = createFlagResult(["off", SESSION_ID], { configDir });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(readdirSync(buildActiveDir(configDir))).toStrictEqual([
        OTHER_SESSION_ID,
      ]);
    });

    test("off は active ディレクトリが無くても成功し、何も作らない", () => {
      // Arrange
      const configDir = createTempDir();

      // Act
      const result = createFlagResult(["off", SESSION_ID], { configDir });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(existsSync(buildRikaiDir(configDir))).toBe(false);
    });

    test("off は他のセッションのフラグを消さない", () => {
      // Arrange
      const configDir = createTempDir();
      createFlag(configDir, SESSION_ID);
      const otherFlagPath = createFlag(configDir, OTHER_SESSION_ID);

      // Act
      const result = createFlagResult(["off", SESSION_ID], { configDir });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(existsSync(otherFlagPath)).toBe(true);
      expect(existsSync(buildFlagPath(configDir, SESSION_ID))).toBe(false);
    });

    test.each([
      { command: "on", configDirEnv: undefined, seeded: [], shouldExist: true },
      { command: "on", configDirEnv: "", seeded: [], shouldExist: true },
      {
        command: "off",
        configDirEnv: undefined,
        seeded: [SESSION_ID],
        shouldExist: false,
      },
      {
        command: "off",
        configDirEnv: "",
        seeded: [SESSION_ID],
        shouldExist: false,
      },
    ])(
      "$command は CLAUDE_CONFIG_DIR が [$configDirEnv] なら HOME 配下の .claude を使う",
      ({ command, configDirEnv, seeded, shouldExist }) => {
        // Arrange
        const homeDir = createTempDir();
        const defaultConfigDir = join(homeDir, DEFAULT_CONFIG_DIR_NAME);
        for (const sessionId of seeded) {
          createFlag(defaultConfigDir, sessionId);
        }
        const env = { [HOME_ENV]: homeDir, [CONFIG_DIR_ENV]: configDirEnv };

        // Act
        const result = createFlagResult([command, SESSION_ID], { env });

        // Assert
        expect(result).toStrictEqual(SUCCESS_RESULT);
        expect(existsSync(buildFlagPath(defaultConfigDir, SESSION_ID))).toBe(
          shouldExist,
        );
      },
    );
  });

  describe("異常系", () => {
    test.each(
      ["on", "off"].flatMap((command) => [
        { command, label: "../x", sessionArgs: ["../x"] },
        { command, label: "a/b", sessionArgs: ["a/b"] },
        { command, label: "a.b", sessionArgs: ["a.b"] },
        { command, label: "空白を含む", sessionArgs: ["a b"] },
        { command, label: "末尾の改行", sessionArgs: ["abc\n"] },
        { command, label: "非 ASCII", sessionArgs: ["あ"] },
        { command, label: "空文字", sessionArgs: [""] },
        { command, label: "省略", sessionArgs: [] },
      ]),
    )(
      "$command は不正な session_id ($label) を拒否し、何も作らない",
      ({ command, sessionArgs }) => {
        // Arrange
        const configDir = createTempDir();

        // Act
        const result = createFlagResult([command, ...sessionArgs], {
          configDir,
        });

        // Assert
        expect(result).toStrictEqual(buildRejectedResult(SESSION_ID_REASON));
        expect(readdirSync(configDir)).toStrictEqual([]);
      },
    );

    test.each([{ command: "on" }, { command: "off" }])(
      "$command は ../x を拒否し、active の外のファイルを変えない",
      ({ command }) => {
        // Arrange
        const configDir = createTempDir();
        createFlag(configDir, OTHER_SESSION_ID);
        const outsidePath = join(buildRikaiDir(configDir), OUTSIDE_NAME);
        writeFileSync(outsidePath, OUTSIDE_CONTENT);

        // Act
        const result = createFlagResult([command, `../${OUTSIDE_NAME}`], {
          configDir,
        });

        // Assert
        expect(result).toStrictEqual(buildRejectedResult(SESSION_ID_REASON));
        expect(readFileSync(outsidePath, "utf8")).toBe(OUTSIDE_CONTENT);
        expect(readdirSync(buildActiveDir(configDir))).toStrictEqual([
          OTHER_SESSION_ID,
        ]);
      },
    );

    test.each([
      { name: "サブコマンドなし", args: [] },
      { name: "未知のサブコマンド", args: ["bogus", SESSION_ID] },
      { name: "大文字の ON", args: ["ON", SESSION_ID] },
      { name: "空文字のサブコマンド", args: ["", SESSION_ID] },
    ])("$name は拒否し、何も作らない", ({ args }) => {
      // Arrange
      const configDir = createTempDir();

      // Act
      const result = createFlagResult(args, { configDir });

      // Assert
      expect(result).toStrictEqual(buildRejectedResult(SUBCOMMAND_REASON));
      expect(readdirSync(configDir)).toStrictEqual([]);
    });
  });
});
