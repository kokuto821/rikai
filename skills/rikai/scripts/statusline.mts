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

const resolveConfigDir = (): string => {
  const fromEnv = process.env[CONFIG_DIR_ENV];
  return resolve(fromEnv ? fromEnv : join(homedir(), DEFAULT_CONFIG_DIR_NAME));
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

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

const isRealDirectory = (path: string): boolean => {
  const stats = lstatOrNull(path);
  return stats?.isDirectory() === true && !stats.isSymbolicLink();
};

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
