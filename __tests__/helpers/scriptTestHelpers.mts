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

/** スクリプトを実行した結果。 */
export type ScriptResult = {
  status: number | null;
  stdout: string;
  stderr: string;
};

export type ScriptOptions = {
  /** CLAUDE_CONFIG_DIR に渡すディレクトリ。省略すると空の一時ディレクトリを使う。 */
  configDir?: string;
  /** 既定の環境変数を上書きする。値が undefined のキーは削除する。 */
  env?: Record<string, string | undefined>;
  /** 標準入力に渡す文字列。 */
  input?: string;
  /** スクリプトを実行するカレントディレクトリ。 */
  cwd?: string;
  /** スクリプトのパスより前に `node` へ渡す引数。 */
  nodeArgs?: string[];
};

const tempDirs: string[] = [];

/**
 * 空の一時ディレクトリを作る。`cleanupTempDirs` でまとめて削除される。
 *
 * @returns 作成したディレクトリの絶対パス
 */
export const createTempDir = (): string => {
  const dir = mkdtempSync(join(tmpdir(), TEMP_DIR_PREFIX));
  tempDirs.push(dir);
  return dir;
};

/**
 * `createTempDir` で作った一時ディレクトリをすべて削除する。
 * 各テストファイル側で `afterEach(cleanupTempDirs)` を明示的に呼び出す。
 */
export const cleanupTempDirs = (): void => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
};

/**
 * スクリプトに渡す環境変数を組み立てる。
 * 実際の ~/.claude に触れないよう、設定ディレクトリとホームを一時ディレクトリにする。
 *
 * @param options - `configDir` と `env` を使う
 * @returns 値が undefined のキーを除いた環境変数
 */
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

/**
 * スクリプトを別プロセスの `node` で実行し、結果を返す。
 *
 * @param scriptPath - 実行するスクリプトのパス
 * @param args - スクリプトに渡す引数
 * @param options - 環境変数・標準入力・cwd などの指定
 * @returns 終了コード・標準出力・標準エラー
 */
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

/**
 * `pick.mts` を実行し、結果を返す。
 *
 * @param args - `pick.mts` に渡す引数
 * @param options - 環境変数・標準入力・cwd などの指定
 * @returns 終了コード・標準出力・標準エラー
 */
export const createPickResult = (
  args: string[],
  options: ScriptOptions = {},
): ScriptResult => createScriptResult(PICK_SCRIPT_PATH, args, options);

/**
 * `flag.mts` を実行し、結果を返す。
 *
 * @param args - `flag.mts` に渡す引数（サブコマンドと session_id）
 * @param options - 環境変数・標準入力・cwd などの指定
 * @returns 終了コード・標準出力・標準エラー
 */
export const createFlagResult = (
  args: string[],
  options: ScriptOptions = {},
): ScriptResult => createScriptResult(FLAG_SCRIPT_PATH, args, options);

/**
 * `statusline.mts` を実行し、結果を返す。
 *
 * @param input - 標準入力に渡す文字列（statusline の JSON）
 * @param options - 環境変数・cwd などの指定。`input` は上書きされる
 * @returns 終了コード・標準出力・標準エラー
 */
export const createStatuslineResult = (
  input: string,
  options: ScriptOptions = {},
): ScriptResult =>
  createScriptResult(STATUSLINE_SCRIPT_PATH, [], { ...options, input });

/**
 * 正規表現の特殊文字をエスケープする。
 *
 * @param text - エスケープする文字列
 * @returns 正規表現にそのまま埋め込める文字列
 */
const buildEscapedText = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * 拒否された時の標準エラーに合う正規表現を作る。
 * 空白のみでなく、module-not-found でなく、reason を含むものに合う。
 *
 * @param reason - 標準エラーに含まれるべき文字列。省略すると含有を問わない
 * @returns 標準エラーの検査用の正規表現
 */
const buildRejectedStderrPattern = (reason: string | undefined): RegExp => {
  const notModuleNotFound = `(?![\\s\\S]*(?:${MODULE_NOT_FOUND_MESSAGES.join("|")}))`;
  const includesReason =
    reason === undefined ? "" : `(?=[\\s\\S]*${buildEscapedText(reason)})`;
  return new RegExp(`^${notModuleNotFound}${includesReason}[\\s\\S]*\\S`);
};

/**
 * 失敗終了の期待値を作る。
 * stderr は空白のみでなく、module-not-found でなく、reason を含む。
 *
 * @param reason - 標準エラーに含まれるべき文字列
 * @returns `toStrictEqual` に渡す期待値
 */
export const buildRejectedResult = (reason?: string) => ({
  status: FAILURE_EXIT_CODE,
  stdout: "",
  stderr: expect.stringMatching(buildRejectedStderrPattern(reason)),
});

/**
 * 設定ディレクトリ配下の `rikai/` のパスを返す。
 *
 * @param configDir - 設定ディレクトリ
 * @returns rikai ディレクトリのパス
 */
export const buildRikaiDir = (configDir: string): string =>
  join(configDir, RIKAI_DIR_NAME);

/**
 * 設定ディレクトリ配下の `rikai/active/` のパスを返す。
 *
 * @param configDir - 設定ディレクトリ
 * @returns active ディレクトリのパス
 */
export const buildActiveDir = (configDir: string): string =>
  join(buildRikaiDir(configDir), ACTIVE_DIR_NAME);

/**
 * セッションのフラグファイルのパスを返す。
 *
 * @param configDir - 設定ディレクトリ
 * @param sessionId - セッション ID
 * @returns フラグファイルのパス
 */
export const buildFlagPath = (configDir: string, sessionId: string): string =>
  join(buildActiveDir(configDir), sessionId);

/**
 * `install` がコピーする statusline.mts の、コピー先のパスを返す。
 *
 * @param configDir - 設定ディレクトリ
 * @returns コピー先のパス
 */
export const buildCopyPath = (configDir: string): string =>
  join(buildRikaiDir(configDir), STATUSLINE_NAME);

/**
 * セッションの空のフラグファイルを作る。`active/` が無ければ作る。
 *
 * @param configDir - 設定ディレクトリ
 * @param sessionId - セッション ID
 * @returns 作成したフラグファイルのパス
 */
export const createFlag = (configDir: string, sessionId: string): string => {
  mkdirSync(buildActiveDir(configDir), { recursive: true });
  const flagPath = buildFlagPath(configDir, sessionId);
  writeFileSync(flagPath, EMPTY_FLAG_CONTENT);
  return flagPath;
};

/**
 * パスの状態を、前後比較用の値にして返す。
 * ディレクトリは中身ごと、ファイルは内容、存在しなければ目印の文字列を返す。
 *
 * @param path - 調べるパス
 * @returns ディレクトリならエントリの配列、ファイルなら内容、無ければ `MISSING_SNAPSHOT`
 */
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
