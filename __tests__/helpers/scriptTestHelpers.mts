import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { expect } from "vitest";

const SCRIPTS_DIR = resolve(import.meta.dirname, "../../skills/rikai/scripts");
const PICK_SCRIPT_PATH = join(SCRIPTS_DIR, "pick.mts");
export const BUILD_ZIP_SCRIPT_PATH = resolve(
  import.meta.dirname,
  "../../scripts/build-zip.mts",
);

export const SUCCESS_EXIT_CODE = 0;
const FAILURE_EXIT_CODE = 1;
const MISSING_SNAPSHOT = "<missing>";
export const SUCCESS_RESULT = {
  status: SUCCESS_EXIT_CODE,
  stdout: "",
  stderr: "",
};
const MODULE_NOT_FOUND_MESSAGES = [
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

type ScriptOptions = {
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
 * スクリプトを別プロセスの `node` で実行し、結果を返す。
 *
 * @param scriptPath - 実行するスクリプトのパス
 * @param args - スクリプトに渡す引数
 * @param options - cwd と node の引数の指定
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
      cwd: options.cwd,
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
 * @param options - cwd と node の引数の指定
 * @returns 終了コード・標準出力・標準エラー
 */
export const createPickResult = (
  args: string[],
  options: ScriptOptions = {},
): ScriptResult => createScriptResult(PICK_SCRIPT_PATH, args, options);

/**
 * `build-zip.mts` を実行し、結果を返す。
 *
 * @param args - `build-zip.mts` に渡す引数（outPath と skillPath）
 * @param options - cwd と node の引数の指定
 * @returns 終了コード・標準出力・標準エラー
 */
export const createBuildZipResult = (
  args: string[],
  options: ScriptOptions = {},
): ScriptResult => createScriptResult(BUILD_ZIP_SCRIPT_PATH, args, options);

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
 * ファイルの状態を、前後比較用の値にして返す。
 * 存在すれば内容、存在しなければ目印の文字列を返す。
 *
 * @param path - 調べるファイルのパス
 * @returns ファイルの内容。無ければ `MISSING_SNAPSHOT`
 */
export const createSnapshot = (path: string): string =>
  existsSync(path) ? readFileSync(path, UTF8) : MISSING_SNAPSHOT;
