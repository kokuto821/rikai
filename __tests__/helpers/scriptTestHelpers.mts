import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect } from "vitest";

export const SCRIPTS_DIR = resolve(
  import.meta.dirname,
  "../../skills/rikai/scripts",
);
export const PICK_SCRIPT_PATH = join(SCRIPTS_DIR, "pick.mts");
export const FLAG_SCRIPT_PATH = join(SCRIPTS_DIR, "flag.mts");
export const STATUSLINE_SCRIPT_PATH = join(SCRIPTS_DIR, "statusline.mts");

export const SUCCESS_EXIT_CODE = 0;
export const FAILURE_EXIT_CODE = 1;
export const CONFIG_DIR_ENV = "CLAUDE_CONFIG_DIR";
export const HOME_ENV = "HOME";
export const USERPROFILE_ENV = "USERPROFILE";
export const RIKAI_DIR_NAME = "rikai";
export const ACTIVE_DIR_NAME = "active";
export const DEFAULT_CONFIG_DIR_NAME = ".claude";
export const STATUSLINE_NAME = "statusline.mts";
export const SETTINGS_NAME = "settings.json";
export const SESSION_ID = "session-1_A";
export const OTHER_SESSION_ID = "session-2";
export const OUTSIDE_NAME = "x";
export const INDICATOR = "[理解]";
export const EMPTY_FLAG_CONTENT = "";
export const SYMLINK_REASON = "symlink";
export const SESSION_ID_REASON = "session_id";
export const MISSING_SNAPSHOT = "<missing>";
export const SUCCESS_RESULT = {
  status: SUCCESS_EXIT_CODE,
  stdout: "",
  stderr: "",
};
export const MODULE_NOT_FOUND_MESSAGES = [
  "Cannot find module",
  "ERR_MODULE_NOT_FOUND",
];

const TEMP_DIR_PREFIX = "rikai-test-";
const UTF8 = "utf8";

export type ScriptResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

export type ScriptOptions = {
  // CLAUDE_CONFIG_DIR に渡すディレクトリ。省略すると空の一時ディレクトリを使う。
  configDir?: string;
  // 既定の環境変数を上書きする。値が undefined のキーは削除する。
  env?: Record<string, string | undefined>;
  input?: string;
  cwd?: string;
  nodeArgs?: string[];
};

const tempDirs: string[] = [];

export const createTempDir = (): string => {
  const dir = mkdtempSync(join(tmpdir(), TEMP_DIR_PREFIX));
  tempDirs.push(dir);
  return dir;
};

// 各テストファイル側で `afterEach(cleanupTempDirs)` を明示的に呼び出す。
export const cleanupTempDirs = (): void => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
};

// 実際の ~/.claude に触れないよう、設定ディレクトリとホームを一時ディレクトリにする。
const buildScriptEnv = (options: ScriptOptions): NodeJS.ProcessEnv => {
  const { [CONFIG_DIR_ENV]: _removed, ...baseEnv } = process.env;
  const homeDir = createTempDir();
  const merged: Record<string, string | undefined> = {
    ...baseEnv,
    [CONFIG_DIR_ENV]: options.configDir ?? createTempDir(),
    [HOME_ENV]: homeDir,
    [USERPROFILE_ENV]: homeDir,
    ...options.env,
  };
  return Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value !== undefined),
  );
};

export const createScriptResult = (
  scriptPath: string,
  args: string[],
  options: ScriptOptions = {},
): ScriptResult => {
  const result = spawnSync(
    "node",
    [...(options.nodeArgs ?? []), scriptPath, ...args],
    {
      encoding: UTF8,
      input: options.input,
      cwd: options.cwd,
      env: buildScriptEnv(options),
    },
  );
  return {
    status: result.status,
    stdout: result.stdout,
    stderr: result.stderr,
  };
};

export const createPickResult = (
  args: string[],
  options: ScriptOptions = {},
): ScriptResult => createScriptResult(PICK_SCRIPT_PATH, args, options);

export const createFlagResult = (
  args: string[],
  options: ScriptOptions = {},
): ScriptResult => createScriptResult(FLAG_SCRIPT_PATH, args, options);

export const createStatuslineResult = (
  input: string,
  options: ScriptOptions = {},
): ScriptResult =>
  createScriptResult(STATUSLINE_SCRIPT_PATH, [], { ...options, input });

const buildEscapedText = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildRejectedStderrPattern = (reason: string | undefined): RegExp => {
  const notModuleNotFound = `(?![\\s\\S]*(?:${MODULE_NOT_FOUND_MESSAGES.join("|")}))`;
  const includesReason =
    reason === undefined ? "" : `(?=[\\s\\S]*${buildEscapedText(reason)})`;
  return new RegExp(`^${notModuleNotFound}${includesReason}[\\s\\S]*\\S`);
};

// 失敗終了の期待値。stderr は空白のみでなく、module-not-found でなく、reason を含む。
export const buildRejectedResult = (reason?: string) => ({
  status: FAILURE_EXIT_CODE,
  stdout: "",
  stderr: expect.stringMatching(buildRejectedStderrPattern(reason)),
});

export const buildRikaiDir = (configDir: string): string =>
  join(configDir, RIKAI_DIR_NAME);

export const buildActiveDir = (configDir: string): string =>
  join(buildRikaiDir(configDir), ACTIVE_DIR_NAME);

export const buildFlagPath = (configDir: string, sessionId: string): string =>
  join(buildActiveDir(configDir), sessionId);

export const buildCopyPath = (configDir: string): string =>
  join(buildRikaiDir(configDir), STATUSLINE_NAME);

export const createFlag = (configDir: string, sessionId: string): string => {
  mkdirSync(buildActiveDir(configDir), { recursive: true });
  const flagPath = buildFlagPath(configDir, sessionId);
  writeFileSync(flagPath, EMPTY_FLAG_CONTENT);
  return flagPath;
};

// ディレクトリは中身ごと、ファイルは内容、存在しなければ目印の文字列を返す。
export const createSnapshot = (path: string): string[] | string => {
  if (!existsSync(path)) {
    return MISSING_SNAPSHOT;
  }
  if (lstatSync(path).isDirectory()) {
    return readdirSync(path, { recursive: true })
      .map((entry) => {
        const entryPath = join(path, String(entry));
        return lstatSync(entryPath).isFile()
          ? `${entry}=${readFileSync(entryPath, UTF8)}`
          : String(entry);
      })
      .sort();
  }
  return readFileSync(path, UTF8);
};
