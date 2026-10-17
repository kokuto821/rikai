import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const SCRIPTS_DIR = resolve(import.meta.dirname, "../skills/rikai/scripts");
const SCRIPT_PATH = join(SCRIPTS_DIR, "flag.mts");
const STATUSLINE_SOURCE_PATH = join(SCRIPTS_DIR, "statusline.mts");
const TEMP_DIR_PREFIX = "rikai-flag-";
const RIKAI_DIR_NAME = "rikai";
const ACTIVE_DIR_NAME = "active";
const DEFAULT_CONFIG_DIR_NAME = ".claude";
const STATUSLINE_NAME = "statusline.mts";
const SETTINGS_NAME = "settings.json";
const CONFIG_DIR_ENV = "CLAUDE_CONFIG_DIR";
const HOME_ENV = "HOME";
const SESSION_ID = "session-1_A";
const OTHER_SESSION_ID = "session-2";
const OUTSIDE_NAME = "x";
const SUCCESS_EXIT_CODE = 0;
const FAILURE_EXIT_CODE = 1;
const SUCCESS_RESULT = { status: SUCCESS_EXIT_CODE, stdout: "", stderr: "" };
const TARGET_CONTENT = "link-target-content";
const OLD_COPY_CONTENT = "old-copy-content";
const SETTINGS_CONTENT = '{"existing": true}\n';
const MODULE_NOT_FOUND_MESSAGES = [
  "Cannot find module",
  "ERR_MODULE_NOT_FOUND",
];

type LinkKind = "rikai" | "active" | "flag";
type Command = "on" | "off";

const LINK_KINDS: LinkKind[] = ["rikai", "active", "flag"];
const COMMANDS: Command[] = ["on", "off"];

const tempDirs: string[] = [];

const createTempDir = (): string => {
  const dir = mkdtempSync(join(tmpdir(), TEMP_DIR_PREFIX));
  tempDirs.push(dir);
  return dir;
};

const buildRikaiDir = (configDir: string): string =>
  join(configDir, RIKAI_DIR_NAME);

const buildActiveDir = (configDir: string): string =>
  join(buildRikaiDir(configDir), ACTIVE_DIR_NAME);

const buildFlagPath = (configDir: string, sessionId: string): string =>
  join(buildActiveDir(configDir), sessionId);

const buildCopyPath = (configDir: string): string =>
  join(buildRikaiDir(configDir), STATUSLINE_NAME);

const createFlag = (configDir: string, sessionId: string): string => {
  mkdirSync(buildActiveDir(configDir), { recursive: true });
  const flagPath = buildFlagPath(configDir, sessionId);
  writeFileSync(flagPath, "");
  return flagPath;
};

const runFlag = (args: string[], env: Record<string, string>) => {
  const { [CONFIG_DIR_ENV]: _removed, ...baseEnv } = process.env;
  const result = spawnSync("node", [SCRIPT_PATH, ...args], {
    encoding: "utf8",
    env: { ...baseEnv, ...env },
  });
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
};

const runWithConfigDir = (args: string[], configDir: string) =>
  runFlag(args, { [CONFIG_DIR_ENV]: configDir });

const expectRejected = (result: ReturnType<typeof runFlag>): void => {
  expect(result.status).toBe(FAILURE_EXIT_CODE);
  expect(result.stdout).toBe("");
  expect(result.stderr.trim()).not.toBe("");
  for (const message of MODULE_NOT_FOUND_MESSAGES) {
    expect(result.stderr).not.toContain(message);
  }
};

const snapshot = (path: string): string[] | string => {
  if (lstatSync(path).isDirectory()) {
    return readdirSync(path, { recursive: true })
      .map((entry) => {
        const entryPath = join(path, String(entry));
        return lstatSync(entryPath).isFile()
          ? `${entry}=${readFileSync(entryPath, "utf8")}`
          : String(entry);
      })
      .sort();
  }
  return readFileSync(path, "utf8");
};

const isSymlink = (path: string): boolean => lstatSync(path).isSymbolicLink();

// 本物のディレクトリ構成を作る。link が true なら、kind の箇所だけ symlink にする。
const buildLayout = (
  configDir: string,
  kind: LinkKind,
  link: boolean,
): { linkPath: string; targetPath: string } => {
  const targetRoot = createTempDir();
  mkdirSync(configDir, { recursive: true });
  if (kind === "rikai") {
    const targetPath = targetRoot;
    const inner = join(targetRoot, ACTIVE_DIR_NAME);
    mkdirSync(inner);
    writeFileSync(join(inner, SESSION_ID), TARGET_CONTENT);
    const linkPath = buildRikaiDir(configDir);
    if (link) {
      // targetRoot 直下に active/ を置いた構成を rikai/ として見せる。
      symlinkSync(targetPath, linkPath);
    } else {
      mkdirSync(buildActiveDir(configDir), { recursive: true });
      writeFileSync(buildFlagPath(configDir, SESSION_ID), TARGET_CONTENT);
    }
    return { linkPath, targetPath };
  }
  if (kind === "active") {
    const targetPath = join(targetRoot, ACTIVE_DIR_NAME);
    mkdirSync(targetPath);
    writeFileSync(join(targetPath, SESSION_ID), TARGET_CONTENT);
    const linkPath = buildActiveDir(configDir);
    mkdirSync(buildRikaiDir(configDir), { recursive: true });
    if (link) {
      symlinkSync(targetPath, linkPath);
    } else {
      mkdirSync(linkPath);
      writeFileSync(buildFlagPath(configDir, SESSION_ID), TARGET_CONTENT);
    }
    return { linkPath, targetPath };
  }
  const targetPath = join(targetRoot, "flag-target");
  writeFileSync(targetPath, TARGET_CONTENT);
  const linkPath = buildFlagPath(configDir, SESSION_ID);
  mkdirSync(buildActiveDir(configDir), { recursive: true });
  if (link) {
    symlinkSync(targetPath, linkPath);
  } else {
    writeFileSync(linkPath, TARGET_CONTENT);
  }
  return { linkPath, targetPath };
};

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("flag", () => {
  test("on はディレクトリを作って空のフラグファイルを作る", () => {
    const configDir = createTempDir();

    const result = runWithConfigDir(["on", SESSION_ID], configDir);

    expect(result).toStrictEqual(SUCCESS_RESULT);
    const flagPath = buildFlagPath(configDir, SESSION_ID);
    expect(readFileSync(flagPath, "utf8")).toBe("");
    expect(readdirSync(buildActiveDir(configDir))).toStrictEqual([SESSION_ID]);
  });

  test("on は 2 回実行しても成功し、フラグが 1 つだけ残る", () => {
    const configDir = createTempDir();
    runWithConfigDir(["on", SESSION_ID], configDir);

    const result = runWithConfigDir(["on", SESSION_ID], configDir);

    expect(result).toStrictEqual(SUCCESS_RESULT);
    expect(readdirSync(buildActiveDir(configDir))).toStrictEqual([SESSION_ID]);
  });

  test("on は他のセッションのフラグを残す", () => {
    const configDir = createTempDir();
    createFlag(configDir, OTHER_SESSION_ID);

    const result = runWithConfigDir(["on", SESSION_ID], configDir);

    expect(result).toStrictEqual(SUCCESS_RESULT);
    expect(readdirSync(buildActiveDir(configDir)).sort()).toStrictEqual(
      [OTHER_SESSION_ID, SESSION_ID].sort(),
    );
  });

  test("off はフラグファイルを削除する", () => {
    const configDir = createTempDir();
    const flagPath = createFlag(configDir, SESSION_ID);

    const result = runWithConfigDir(["off", SESSION_ID], configDir);

    expect(result).toStrictEqual(SUCCESS_RESULT);
    expect(existsSync(flagPath)).toBe(false);
  });

  test("off はフラグが無くても成功する", () => {
    const configDir = createTempDir();
    createFlag(configDir, OTHER_SESSION_ID);

    const result = runWithConfigDir(["off", SESSION_ID], configDir);

    expect(result).toStrictEqual(SUCCESS_RESULT);
    expect(readdirSync(buildActiveDir(configDir))).toStrictEqual([
      OTHER_SESSION_ID,
    ]);
  });

  test("off は active ディレクトリが無くても成功し、何も作らない", () => {
    const configDir = createTempDir();

    const result = runWithConfigDir(["off", SESSION_ID], configDir);

    expect(result).toStrictEqual(SUCCESS_RESULT);
    expect(existsSync(buildRikaiDir(configDir))).toBe(false);
  });

  test("off は他のセッションのフラグを消さない", () => {
    const configDir = createTempDir();
    createFlag(configDir, SESSION_ID);
    const otherFlagPath = createFlag(configDir, OTHER_SESSION_ID);

    const result = runWithConfigDir(["off", SESSION_ID], configDir);

    expect(result).toStrictEqual(SUCCESS_RESULT);
    expect(existsSync(otherFlagPath)).toBe(true);
    expect(existsSync(buildFlagPath(configDir, SESSION_ID))).toBe(false);
  });

  test.each([
    { name: "on", command: "on" },
    { name: "off", command: "off" },
  ])(
    "$name は CLAUDE_CONFIG_DIR が空文字なら HOME 配下の .claude を使う",
    ({ command }) => {
      const homeDir = createTempDir();
      const flagPath = buildFlagPath(
        join(homeDir, DEFAULT_CONFIG_DIR_NAME),
        SESSION_ID,
      );
      if (command === "off") {
        createFlag(join(homeDir, DEFAULT_CONFIG_DIR_NAME), SESSION_ID);
      }

      const result = runFlag([command, SESSION_ID], {
        [HOME_ENV]: homeDir,
        [CONFIG_DIR_ENV]: "",
      });

      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(existsSync(flagPath)).toBe(command === "on");
    },
  );

  test("on は CLAUDE_CONFIG_DIR が未設定なら HOME 配下の .claude を使う", () => {
    const homeDir = createTempDir();

    const result = runFlag(["on", SESSION_ID], { [HOME_ENV]: homeDir });

    expect(result).toStrictEqual(SUCCESS_RESULT);
    const flagPath = buildFlagPath(
      join(homeDir, DEFAULT_CONFIG_DIR_NAME),
      SESSION_ID,
    );
    expect(existsSync(flagPath)).toBe(true);
  });

  test.each(
    COMMANDS.flatMap((command) =>
      [
        { label: "../x", sessionArgs: ["../x"] },
        { label: "a/b", sessionArgs: ["a/b"] },
        { label: "a.b", sessionArgs: ["a.b"] },
        { label: "空文字", sessionArgs: [""] },
        { label: "省略", sessionArgs: [] },
      ].map((entry) => ({ command, ...entry })),
    ),
  )(
    "$command は不正な session_id ($label) を拒否し、何も作らない",
    ({ command, sessionArgs }) => {
      const configDir = createTempDir();

      const result = runWithConfigDir([command, ...sessionArgs], configDir);

      expectRejected(result);
      expect(readdirSync(configDir)).toStrictEqual([]);
    },
  );

  test("off は ../x を拒否し、active の外のファイルを消さない", () => {
    const configDir = createTempDir();
    createFlag(configDir, OTHER_SESSION_ID);
    const outsidePath = join(buildRikaiDir(configDir), OUTSIDE_NAME);
    writeFileSync(outsidePath, TARGET_CONTENT);

    const result = runWithConfigDir(["off", `../${OUTSIDE_NAME}`], configDir);

    expectRejected(result);
    expect(readFileSync(outsidePath, "utf8")).toBe(TARGET_CONTENT);
  });

  test("on は ../x を拒否し、active の外にファイルを作らない", () => {
    const configDir = createTempDir();
    mkdirSync(buildActiveDir(configDir), { recursive: true });

    const result = runWithConfigDir(["on", `../${OUTSIDE_NAME}`], configDir);

    expectRejected(result);
    expect(existsSync(join(buildRikaiDir(configDir), OUTSIDE_NAME))).toBe(
      false,
    );
    expect(readdirSync(buildActiveDir(configDir))).toStrictEqual([]);
  });

  test.each([
    { name: "サブコマンドなし", args: [] },
    { name: "未知のサブコマンド", args: ["bogus", SESSION_ID] },
    { name: "大文字の ON", args: ["ON", SESSION_ID] },
    { name: "空文字のサブコマンド", args: ["", SESSION_ID] },
  ])("$name は拒否し、何も作らない", ({ args }) => {
    const configDir = createTempDir();

    const result = runWithConfigDir(args, configDir);

    expectRejected(result);
    expect(readdirSync(configDir)).toStrictEqual([]);
  });

  test.each(
    COMMANDS.flatMap((command) =>
      LINK_KINDS.map((kind) => ({ command, kind })),
    ),
  )(
    "$command は $kind が symlink なら拒否し、リンク先を変えない",
    ({ command, kind }) => {
      const controlDir = createTempDir();
      buildLayout(controlDir, kind, false);
      const controlResult = runWithConfigDir([command, SESSION_ID], controlDir);
      expect(controlResult).toStrictEqual(SUCCESS_RESULT);
      expect(existsSync(buildFlagPath(controlDir, SESSION_ID))).toBe(
        command === "on",
      );
      const configDir = createTempDir();
      const { linkPath, targetPath } = buildLayout(configDir, kind, true);
      const before = snapshot(targetPath);

      const result = runWithConfigDir([command, SESSION_ID], configDir);

      expectRejected(result);
      expect(snapshot(targetPath)).toStrictEqual(before);
      expect(isSymlink(linkPath)).toBe(true);
    },
  );

  test("install は statusline.mts を rikai/ にコピーする", () => {
    const configDir = createTempDir();

    const result = runWithConfigDir(["install"], configDir);

    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(result.stderr).toBe("");
    expect(readFileSync(buildCopyPath(configDir), "utf8")).toBe(
      readFileSync(STATUSLINE_SOURCE_PATH, "utf8"),
    );
  });

  test("install はコピー先が既にあれば上書きする", () => {
    const configDir = createTempDir();
    mkdirSync(buildRikaiDir(configDir), { recursive: true });
    writeFileSync(buildCopyPath(configDir), OLD_COPY_CONTENT);

    const result = runWithConfigDir(["install"], configDir);

    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(result.stderr).toBe("");
    expect(readFileSync(buildCopyPath(configDir), "utf8")).toBe(
      readFileSync(STATUSLINE_SOURCE_PATH, "utf8"),
    );
  });

  test("install は settings.json に追記するスニペットを標準出力に出す", () => {
    const configDir = createTempDir();

    const result = runWithConfigDir(["install"], configDir);

    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(result.stderr).toBe("");
    const firstBrace = result.stdout.indexOf("{");
    const lastBrace = result.stdout.lastIndexOf("}");
    expect(firstBrace).toBeGreaterThanOrEqual(0);
    expect(lastBrace).toBeGreaterThan(firstBrace);
    const snippet: unknown = JSON.parse(
      result.stdout.slice(firstBrace, lastBrace + 1),
    );
    expect(snippet).toStrictEqual({
      statusLine: {
        type: "command",
        command: `node ${buildCopyPath(configDir)}`,
      },
    });
    expect(result.stdout.slice(0, firstBrace).trim()).not.toBe("");
    expect(result.stdout.slice(lastBrace + 1).trim()).not.toBe("");
  });

  test("install は CLAUDE_CONFIG_DIR が未設定なら HOME 配下の .claude を使う", () => {
    const homeDir = createTempDir();
    const configDir = join(homeDir, DEFAULT_CONFIG_DIR_NAME);

    const result = runFlag(["install"], { [HOME_ENV]: homeDir });

    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(result.stderr).toBe("");
    expect(readFileSync(buildCopyPath(configDir), "utf8")).toBe(
      readFileSync(STATUSLINE_SOURCE_PATH, "utf8"),
    );
    expect(result.stdout).toContain(`node ${buildCopyPath(configDir)}`);
  });

  test("install は既存の settings.json を読み書きしない", () => {
    const configDir = createTempDir();
    const settingsPath = join(configDir, SETTINGS_NAME);
    writeFileSync(settingsPath, SETTINGS_CONTENT);

    const result = runWithConfigDir(["install"], configDir);

    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(existsSync(buildCopyPath(configDir))).toBe(true);
    expect(readFileSync(settingsPath, "utf8")).toBe(SETTINGS_CONTENT);
  });

  test("install は settings.json が無ければ作らない", () => {
    const configDir = createTempDir();

    const result = runWithConfigDir(["install"], configDir);

    expect(result.status).toBe(SUCCESS_EXIT_CODE);
    expect(existsSync(buildCopyPath(configDir))).toBe(true);
    expect(existsSync(join(configDir, SETTINGS_NAME))).toBe(false);
  });

  test("install は rikai/ が symlink なら拒否し、リンク先を変えない", () => {
    const configDir = createTempDir();
    const targetDir = createTempDir();
    writeFileSync(join(targetDir, "sentinel"), TARGET_CONTENT);
    symlinkSync(targetDir, buildRikaiDir(configDir));
    const before = snapshot(targetDir);

    const result = runWithConfigDir(["install"], configDir);

    expectRejected(result);
    expect(snapshot(targetDir)).toStrictEqual(before);
    expect(isSymlink(buildRikaiDir(configDir))).toBe(true);
  });

  test("install はコピー先が symlink なら拒否し、リンク先を変えない", () => {
    const configDir = createTempDir();
    const targetPath = join(createTempDir(), "copy-target");
    writeFileSync(targetPath, TARGET_CONTENT);
    mkdirSync(buildRikaiDir(configDir), { recursive: true });
    symlinkSync(targetPath, buildCopyPath(configDir));

    const result = runWithConfigDir(["install"], configDir);

    expectRejected(result);
    expect(readFileSync(targetPath, "utf8")).toBe(TARGET_CONTENT);
    expect(isSymlink(buildCopyPath(configDir))).toBe(true);
  });

  test("install は余分な引数があれば拒否し、何も作らない", () => {
    const configDir = createTempDir();

    const result = runWithConfigDir(["install", "extra"], configDir);

    expectRejected(result);
    expect(readdirSync(configDir)).toStrictEqual([]);
  });
});
