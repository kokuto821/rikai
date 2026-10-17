import {
  copyFileSync,
  lstatSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const FAILURE_EXIT_CODE = 1;
const CONFIG_DIR_ENV = "CLAUDE_CONFIG_DIR";
const DEFAULT_CONFIG_DIR_NAME = ".claude";
const RIKAI_DIR_NAME = "rikai";
const ACTIVE_DIR_NAME = "active";
const STATUSLINE_NAME = "statusline.mts";
const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const NOT_FOUND_CODE = "ENOENT";
const JSON_INDENT = 2;
const EMPTY_CONTENT = "";
const COMMAND_ON = "on";
const COMMAND_OFF = "off";
const COMMAND_INSTALL = "install";
const USAGE = "使い方: flag.mts <on|off|install> [session_id]";

const resolveConfigDir = (): string => {
  const fromEnv = process.env[CONFIG_DIR_ENV];
  return fromEnv ? fromEnv : join(homedir(), DEFAULT_CONFIG_DIR_NAME);
};

const buildRikaiDir = (): string => join(resolveConfigDir(), RIKAI_DIR_NAME);

const buildActiveDir = (): string => join(buildRikaiDir(), ACTIVE_DIR_NAME);

const parseSessionId = (raw: string | undefined): string => {
  if (raw === undefined || !SESSION_ID_PATTERN.test(raw)) {
    throw new Error(
      `session_id は英数字・ハイフン・アンダースコアのみ指定できます: "${raw ?? ""}"`,
    );
  }
  return raw;
};

const isSymlink = (path: string): boolean => {
  try {
    return lstatSync(path).isSymbolicLink();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === NOT_FOUND_CODE) {
      return false;
    }
    throw error;
  }
};

const assertNotSymlink = (path: string): void => {
  if (isSymlink(path)) {
    throw new Error(`symlink は扱えません: ${path}`);
  }
};

const runOn = (sessionId: string): void => {
  const activeDir = buildActiveDir();
  const flagPath = join(activeDir, sessionId);
  assertNotSymlink(buildRikaiDir());
  assertNotSymlink(activeDir);
  mkdirSync(activeDir, { recursive: true });
  assertNotSymlink(flagPath);
  writeFileSync(flagPath, EMPTY_CONTENT);
};

const runOff = (sessionId: string): void => {
  const activeDir = buildActiveDir();
  const flagPath = join(activeDir, sessionId);
  assertNotSymlink(buildRikaiDir());
  assertNotSymlink(activeDir);
  assertNotSymlink(flagPath);
  rmSync(flagPath, { force: true });
};

const buildSnippet = (copyPath: string): string => {
  const settings = {
    statusLine: { type: "command", command: `node ${copyPath}` },
  };
  return [
    "次の内容を settings.json に追記してください。",
    "",
    JSON.stringify(settings, null, JSON_INDENT),
    "",
    "すでに statusLine がある場合は、置き換えずにコマンドを連結してください。",
    "",
  ].join("\n");
};

const runInstall = (): string => {
  const rikaiDir = buildRikaiDir();
  const copyPath = join(rikaiDir, STATUSLINE_NAME);
  assertNotSymlink(rikaiDir);
  mkdirSync(rikaiDir, { recursive: true });
  assertNotSymlink(copyPath);
  copyFileSync(join(import.meta.dirname, STATUSLINE_NAME), copyPath);
  return buildSnippet(copyPath);
};

const run = (args: string[]): string => {
  const [command, ...rest] = args;
  switch (command) {
    case COMMAND_ON:
      runOn(parseSessionId(rest[0]));
      return EMPTY_CONTENT;
    case COMMAND_OFF:
      runOff(parseSessionId(rest[0]));
      return EMPTY_CONTENT;
    case COMMAND_INSTALL:
      if (rest.length > 0) {
        throw new Error("install に引数は指定できません。");
      }
      return runInstall();
    default:
      throw new Error(USAGE);
  }
};

try {
  process.stdout.write(run(process.argv.slice(2)));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(FAILURE_EXIT_CODE);
}
