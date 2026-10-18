import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  buildCopyPath,
  buildRejectedResult,
  buildRikaiDir,
  CONFIG_DIR_ENV,
  createFlag,
  createFlagResult,
  createScriptResult,
  createTempDir,
  DEFAULT_CONFIG_DIR_NAME,
  HOME_ENV,
  INDICATOR,
  SESSION_ID,
  SETTINGS_NAME,
  STATUSLINE_SCRIPT_PATH,
  SUCCESS_EXIT_CODE,
} from "./helpers/scriptTestHelpers.mts";

const OLD_COPY_CONTENT = "old-copy-content";
const SETTINGS_CONTENT = '{"existing": true}\n';
const SPACED_DIR_NAME = "config dir with space";
const RELATIVE_DIR_NAME = "relative-config";

const buildCommand = (copyPath: string): string => `node "${copyPath}"`;

const buildSnippet = (copyPath: string) => ({
  statusLine: { type: "command", command: buildCommand(copyPath) },
});

const buildSnippetObject = (stdout: string): unknown => {
  const firstBrace = stdout.indexOf("{");
  const lastBrace = stdout.lastIndexOf("}");
  return JSON.parse(stdout.slice(firstBrace, lastBrace + 1));
};

describe("flag install", () => {
  test("install は statusline.mts を rikai/ にコピーする", () => {
    // Arrange
    const configDir = createTempDir();

    // Act
    const result = createFlagResult(["install"], { configDir });

    // Assert
    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(result.stderr).toBe("");
    expect(readFileSync(buildCopyPath(configDir), "utf8")).toBe(
      readFileSync(STATUSLINE_SCRIPT_PATH, "utf8"),
    );
  });

  test("install はコピー先が既にあれば上書きする", () => {
    // Arrange
    const configDir = createTempDir();
    mkdirSync(buildRikaiDir(configDir), { recursive: true });
    writeFileSync(buildCopyPath(configDir), OLD_COPY_CONTENT);

    // Act
    const result = createFlagResult(["install"], { configDir });

    // Assert
    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(result.stderr).toBe("");
    expect(readFileSync(buildCopyPath(configDir), "utf8")).toBe(
      readFileSync(STATUSLINE_SCRIPT_PATH, "utf8"),
    );
  });

  test("install は 2 回実行しても成功する", () => {
    // Arrange
    const configDir = createTempDir();
    createFlagResult(["install"], { configDir });

    // Act
    const result = createFlagResult(["install"], { configDir });

    // Assert
    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(result.stderr).toBe("");
    expect(readFileSync(buildCopyPath(configDir), "utf8")).toBe(
      readFileSync(STATUSLINE_SCRIPT_PATH, "utf8"),
    );
  });

  test("install は settings.json に追記するスニペットを標準出力に出す", () => {
    // Arrange
    const configDir = createTempDir();

    // Act
    const result = createFlagResult(["install"], { configDir });

    // Assert
    const firstBrace = result.stdout.indexOf("{");
    const lastBrace = result.stdout.lastIndexOf("}");
    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(result.stderr).toBe("");
    expect(buildSnippetObject(result.stdout)).toStrictEqual(
      buildSnippet(buildCopyPath(configDir)),
    );
    expect(result.stdout.slice(0, firstBrace).trim()).not.toBe("");
    expect(result.stdout.slice(lastBrace + 1).trim()).not.toBe("");
  });

  test("install はパスに空白を含んでもコマンドを引用符で囲む", () => {
    // Arrange
    const configDir = join(createTempDir(), SPACED_DIR_NAME);

    // Act
    const result = createFlagResult(["install"], { configDir });

    // Assert
    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(buildSnippetObject(result.stdout)).toStrictEqual(
      buildSnippet(buildCopyPath(configDir)),
    );
    expect(existsSync(buildCopyPath(configDir))).toBe(true);
  });

  test("install は相対パスの CLAUDE_CONFIG_DIR でもスニペットに絶対パスを出す", () => {
    // Arrange
    const cwd = realpathSync(createTempDir());
    const absoluteConfigDir = join(cwd, RELATIVE_DIR_NAME);

    // Act
    const result = createFlagResult(["install"], {
      configDir: RELATIVE_DIR_NAME,
      cwd,
    });

    // Assert
    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(buildSnippetObject(result.stdout)).toStrictEqual(
      buildSnippet(buildCopyPath(absoluteConfigDir)),
    );
    expect(existsSync(buildCopyPath(absoluteConfigDir))).toBe(true);
  });

  test("install は CLAUDE_CONFIG_DIR が未設定なら HOME 配下の .claude を使う", () => {
    // Arrange
    const homeDir = createTempDir();
    const configDir = join(homeDir, DEFAULT_CONFIG_DIR_NAME);
    const env = { [HOME_ENV]: homeDir, [CONFIG_DIR_ENV]: undefined };

    // Act
    const result = createFlagResult(["install"], { env });

    // Assert
    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(result.stderr).toBe("");
    expect(readFileSync(buildCopyPath(configDir), "utf8")).toBe(
      readFileSync(STATUSLINE_SCRIPT_PATH, "utf8"),
    );
    expect(buildSnippetObject(result.stdout)).toStrictEqual(
      buildSnippet(buildCopyPath(configDir)),
    );
  });

  test("install は既存の settings.json を読み書きしない", () => {
    // Arrange
    const configDir = createTempDir();
    const settingsPath = join(configDir, SETTINGS_NAME);
    writeFileSync(settingsPath, SETTINGS_CONTENT);

    // Act
    const result = createFlagResult(["install"], { configDir });

    // Assert
    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(existsSync(buildCopyPath(configDir))).toBe(true);
    expect(readFileSync(settingsPath, "utf8")).toBe(SETTINGS_CONTENT);
  });

  test("install は settings.json が無ければ作らない", () => {
    // Arrange
    const configDir = createTempDir();

    // Act
    const result = createFlagResult(["install"], { configDir });

    // Assert
    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(existsSync(buildCopyPath(configDir))).toBe(true);
    expect(existsSync(join(configDir, SETTINGS_NAME))).toBe(false);
  });

  test("install は余分な引数があれば拒否し、何も作らない", () => {
    // Arrange
    const configDir = createTempDir();

    // Act
    const result = createFlagResult(["install", "extra"], { configDir });

    // Assert
    expect(result).toStrictEqual(buildRejectedResult());
    expect(readdirSync(configDir)).toStrictEqual([]);
  });

  test("コピーされた statusline.mts はリポジトリ外の cwd でも単体で動く", () => {
    // Arrange
    const configDir = createTempDir();
    createFlagResult(["install"], { configDir });
    createFlag(configDir, SESSION_ID);
    const input = JSON.stringify({ session_id: SESSION_ID });

    // Act
    const result = createScriptResult(buildCopyPath(configDir), [], {
      configDir,
      input,
      cwd: createTempDir(),
    });

    // Assert
    expect(result).toStrictEqual({
      status: SUCCESS_EXIT_CODE,
      stdout: INDICATOR,
      stderr: "",
    });
  });
});
