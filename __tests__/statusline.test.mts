import { spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const SCRIPT_PATH = resolve(
  import.meta.dirname,
  "../skills/rikai/scripts/statusline.mts",
);
const TEMP_DIR_PREFIX = "rikai-statusline-";
const RIKAI_DIR_NAME = "rikai";
const ACTIVE_DIR_NAME = "active";
const DEFAULT_CONFIG_DIR_NAME = ".claude";
const CONFIG_DIR_ENV = "CLAUDE_CONFIG_DIR";
const SESSION_ID = "session-1_A";
const OTHER_SESSION_ID = "session-2";
const OUTSIDE_NAME = "x";
const DOTTED_NAME = "a.b";
const SUCCESS_EXIT_CODE = 0;
const INDICATOR = "[理解]";
const FLAG_CONTENT = "1";
const REAL_TARGET_NAME = "real-target";
const HIDDEN_RESULT = { status: SUCCESS_EXIT_CODE, stdout: "", stderr: "" };
const SHOWN_RESULT = {
  status: SUCCESS_EXIT_CODE,
  stdout: INDICATOR,
  stderr: "",
};

const tempDirs: string[] = [];

const createTempDir = (): string => {
  const dir = mkdtempSync(join(tmpdir(), TEMP_DIR_PREFIX));
  tempDirs.push(dir);
  return dir;
};

const buildActiveDir = (configDir: string): string =>
  join(configDir, RIKAI_DIR_NAME, ACTIVE_DIR_NAME);

const createFlag = (configDir: string, sessionId: string): string => {
  const activeDir = buildActiveDir(configDir);
  mkdirSync(activeDir, { recursive: true });
  const flagPath = join(activeDir, sessionId);
  writeFileSync(flagPath, FLAG_CONTENT);
  return flagPath;
};

const runStatusline = (stdin: string, env: Record<string, string>) => {
  const { [CONFIG_DIR_ENV]: _removed, ...baseEnv } = process.env;
  const result = spawnSync("node", [SCRIPT_PATH], {
    encoding: "utf8",
    input: stdin,
    env: { ...baseEnv, ...env },
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
};

const runWithConfigDir = (stdin: string, configDir: string) =>
  runStatusline(stdin, { [CONFIG_DIR_ENV]: configDir });

const buildInput = (sessionId: unknown): string =>
  JSON.stringify({ session_id: sessionId });

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("statusline", () => {
  test("フラグがあるセッションでは [理解] だけを改行なしで出力する", () => {
    const configDir = createTempDir();
    createFlag(configDir, SESSION_ID);

    const result = runWithConfigDir(buildInput(SESSION_ID), configDir);

    expect(result).toStrictEqual(SHOWN_RESULT);
  });

  test("フラグが無ければ何も出さない", () => {
    const configDir = createTempDir();

    const result = runWithConfigDir(buildInput(SESSION_ID), configDir);

    expect(result).toStrictEqual(HIDDEN_RESULT);
  });

  test("別セッションのフラグしか無ければ何も出さない", () => {
    const configDir = createTempDir();
    createFlag(configDir, OTHER_SESSION_ID);

    const result = runWithConfigDir(buildInput(SESSION_ID), configDir);

    expect(result).toStrictEqual(HIDDEN_RESULT);
  });

  test.each([
    { name: "不正な JSON", stdin: "{not json" },
    { name: "空の標準入力", stdin: "" },
    { name: "session_id の欠落", stdin: JSON.stringify({ other: 1 }) },
    { name: "数値の session_id", stdin: buildInput(123) },
  ])("$name では何も出さない", ({ stdin }) => {
    const configDir = createTempDir();
    createFlag(configDir, SESSION_ID);
    createFlag(configDir, "123");

    const result = runWithConfigDir(stdin, configDir);

    expect(result).toStrictEqual(HIDDEN_RESULT);
  });

  test.each([
    { name: "../x (親ディレクトリへの脱出)", sessionId: `../${OUTSIDE_NAME}` },
    { name: "a/b (パス区切り)", sessionId: "a/b" },
    { name: "a.b (ドット)", sessionId: DOTTED_NAME },
    { name: "空文字", sessionId: "" },
  ])(
    "session_id が不正な文字を含む ($name) と何も出さない",
    ({ sessionId }) => {
      const configDir = createTempDir();
      const activeDir = buildActiveDir(configDir);
      createFlag(configDir, DOTTED_NAME);
      writeFileSync(join(activeDir, "..", OUTSIDE_NAME), FLAG_CONTENT);
      mkdirSync(join(activeDir, "a"), { recursive: true });
      writeFileSync(join(activeDir, "a", "b"), FLAG_CONTENT);

      const result = runWithConfigDir(buildInput(sessionId), configDir);

      expect(result).toStrictEqual(HIDDEN_RESULT);
    },
  );

  test("フラグが symlink なら何も出さない", () => {
    const configDir = createTempDir();
    const activeDir = buildActiveDir(configDir);
    mkdirSync(activeDir, { recursive: true });
    const targetPath = join(configDir, REAL_TARGET_NAME);
    writeFileSync(targetPath, FLAG_CONTENT);
    symlinkSync(targetPath, join(activeDir, SESSION_ID));

    const result = runWithConfigDir(buildInput(SESSION_ID), configDir);

    expect(result).toStrictEqual(HIDDEN_RESULT);
  });

  test("active/ が symlink なら何も出さない", () => {
    const configDir = createTempDir();
    const realActiveDir = join(configDir, REAL_TARGET_NAME);
    mkdirSync(realActiveDir, { recursive: true });
    writeFileSync(join(realActiveDir, SESSION_ID), FLAG_CONTENT);
    mkdirSync(join(configDir, RIKAI_DIR_NAME), { recursive: true });
    symlinkSync(realActiveDir, buildActiveDir(configDir));

    const result = runWithConfigDir(buildInput(SESSION_ID), configDir);

    expect(result).toStrictEqual(HIDDEN_RESULT);
  });

  test("rikai/ が symlink なら何も出さない", () => {
    const configDir = createTempDir();
    const realRikaiDir = join(configDir, REAL_TARGET_NAME);
    createFlag(realRikaiDir, SESSION_ID);
    const realRikaiRoot = join(realRikaiDir, RIKAI_DIR_NAME);
    symlinkSync(realRikaiRoot, join(configDir, RIKAI_DIR_NAME));

    const result = runWithConfigDir(buildInput(SESSION_ID), configDir);

    expect(result).toStrictEqual(HIDDEN_RESULT);
  });

  test("CLAUDE_CONFIG_DIR が未設定なら HOME 配下の .claude を使う", () => {
    const homeDir = createTempDir();
    createFlag(join(homeDir, DEFAULT_CONFIG_DIR_NAME), SESSION_ID);

    const result = runStatusline(buildInput(SESSION_ID), { HOME: homeDir });

    expect(result).toStrictEqual(SHOWN_RESULT);
  });
});
