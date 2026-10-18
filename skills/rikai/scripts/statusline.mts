import { lstatSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const INDICATOR = "[理解]";
const STDIN_FD = 0;
const CONFIG_DIR_ENV = "CLAUDE_CONFIG_DIR";
const DEFAULT_CONFIG_DIR_NAME = ".claude";
const RIKAI_DIR_NAME = "rikai";
const ACTIVE_DIR_NAME = "active";
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

const resolveConfigDir = (): string => {
  const fromEnv = process.env[CONFIG_DIR_ENV];
  return resolve(fromEnv ? fromEnv : join(homedir(), DEFAULT_CONFIG_DIR_NAME));
};

const readSessionId = (raw: string): string | undefined => {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }
  const sessionId: unknown = (parsed as Record<string, unknown>).session_id;
  if (typeof sessionId !== "string" || !SESSION_ID_PATTERN.test(sessionId)) {
    return undefined;
  }
  return sessionId;
};

// lstat は symlink をたどらないため、isDirectory と isFile は symlink で false になる。
const isRealDirectory = (path: string): boolean =>
  lstatSync(path).isDirectory();

const isRealFile = (path: string): boolean => lstatSync(path).isFile();

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
  // statusline の表示を崩さないため、何も出さない。
}
