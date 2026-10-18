import { lstatSync, readFileSync, type Stats } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const INDICATOR = "[理解]";
const STDIN_FD = 0;
const CONFIG_DIR_ENV = "CLAUDE_CONFIG_DIR";
const DEFAULT_CONFIG_DIR_NAME = ".claude";
const RIKAI_DIR_NAME = "rikai";
const ACTIVE_DIR_NAME = "active";
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const NOT_FOUND_CODE = "ENOENT";

// この statusline.mts は flag.mts install によってこのファイル単体で
// ~/.claude/rikai/ 配下にコピーされ、他ファイルに依存せず動く必要がある。
// そのため configPaths.mts・fsReal.mts（flag.mts 用の共通モジュール）を
// import できず、同じロジックをここに複製している。

/**
 * Claude Code の設定ディレクトリを絶対パスで返す。
 * `CLAUDE_CONFIG_DIR` があればそれを使い、無ければ `~/.claude` を使う。
 *
 * @returns 設定ディレクトリの絶対パス
 */
const resolveConfigDir = (): string => {
  const fromEnv = process.env[CONFIG_DIR_ENV];
  return resolve(fromEnv ? fromEnv : join(homedir(), DEFAULT_CONFIG_DIR_NAME));
};

/**
 * 値がオブジェクト（null 以外）かを判定する型ガード。
 *
 * @param value - 判定する値
 * @returns オブジェクトなら true
 */
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * 標準入力の JSON から session_id を取り出す。
 *
 * @param raw - 標準入力の JSON 文字列
 * @returns `SESSION_ID_PATTERN` に合う session_id。無い・不正なら `undefined`
 * @throws raw が JSON として解析できないとき
 */
const readSessionId = (raw: string): string | undefined => {
  const parsed: unknown = JSON.parse(raw);
  if (!isRecord(parsed)) {
    return undefined;
  }
  const sessionId = parsed.session_id;
  if (typeof sessionId !== "string" || !SESSION_ID_PATTERN.test(sessionId)) {
    return undefined;
  }
  return sessionId;
};

/**
 * symlink をたどらずに `lstat` する。パスが無ければ `undefined` を返す。
 *
 * @param path - 調べるパス
 * @returns `Stats`。パスが存在しなければ `undefined`
 * @throws ENOENT 以外の `lstat` のエラーはそのまま投げる。
 */
const lstatOrNull = (path: string): Stats | undefined => {
  try {
    return lstatSync(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === NOT_FOUND_CODE) {
      return undefined;
    }
    throw error;
  }
};

/**
 * パスが symlink ではない実体のディレクトリかを返す。
 *
 * @param path - 調べるパス
 * @returns 実体のディレクトリなら true
 */
const isRealDirectory = (path: string): boolean => {
  const stats = lstatOrNull(path);
  return stats?.isDirectory() === true && !stats.isSymbolicLink();
};

/**
 * パスが symlink ではない実体の通常ファイルかを返す。
 *
 * @param path - 調べるパス
 * @returns 実体の通常ファイルなら true
 */
const isRealFile = (path: string): boolean => {
  const stats = lstatOrNull(path);
  return stats?.isFile() === true && !stats.isSymbolicLink();
};

try {
  const sessionId = readSessionId(readFileSync(STDIN_FD, "utf8"));
  if (sessionId !== undefined) {
    const rikaiDir = join(resolveConfigDir(), RIKAI_DIR_NAME);
    const activeDir = join(rikaiDir, ACTIVE_DIR_NAME);
    const flagPath = join(activeDir, sessionId);
    if (
      isRealDirectory(rikaiDir) &&
      isRealDirectory(activeDir) &&
      isRealFile(flagPath)
    ) {
      process.stdout.write(INDICATOR);
    }
  }
} catch {
  // 標準入力の JSON 解析失敗（不正な JSON・stdin 無し等）やフラグファイルの
  // 読み取り失敗など、想定内外を問わずすべて無視し、statusline の表示を崩さない。
}
