import { copyFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runCli } from "./cli.mts";
import {
  buildActiveDir,
  buildFlagPath,
  buildRikaiDir,
  SESSION_ID_PATTERN,
} from "./configPaths.mts";
import { isSymlink } from "./fsReal.mts";

const STATUSLINE_NAME = "statusline.mts";
const FLAG_FILE_CONTENT = "";
const NO_STDOUT_OUTPUT = "";
const COMMAND_ON = "on";
const COMMAND_OFF = "off";
const COMMAND_INSTALL = "install";
const USAGE =
  "使い方: flag.mts <on|off|install> [session_id]（サブコマンドは on・off・install のいずれかを指定してください）";

const parseSessionId = (raw: string | undefined): string => {
  if (raw === undefined || !SESSION_ID_PATTERN.test(raw)) {
    throw new Error(
      `session_id は英数字・ハイフン・アンダースコアのみ指定できます: "${raw ?? ""}"`,
    );
  }
  return raw;
};

const assertNotSymlink = (path: string): void => {
  if (isSymlink(path)) {
    throw new Error(`symlink は扱えません: ${path}`);
  }
};

const resolveFlagPath = (sessionId: string): string => {
  const activeDir = buildActiveDir();
  assertNotSymlink(buildRikaiDir());
  assertNotSymlink(activeDir);
  return buildFlagPath(sessionId);
};

const runOn = (sessionId: string): void => {
  const flagPath = resolveFlagPath(sessionId);
  mkdirSync(buildActiveDir(), { recursive: true });
  // symlink チェックと書き込みの間に別プロセスが差し替える可能性は残る（TOCTOU）。
  // ローカル開発環境での単一ユーザー利用を前提に許容している。
  assertNotSymlink(flagPath);
  writeFileSync(flagPath, FLAG_FILE_CONTENT);
};

const runOff = (sessionId: string): void => {
  const flagPath = resolveFlagPath(sessionId);
  assertNotSymlink(flagPath);
  rmSync(flagPath, { force: true });
};

const buildSnippet = (copyPath: string): string => {
  const settings = {
    statusLine: {
      type: "command",
      command: `node "${copyPath}"`,
    },
  };
  return [
    "次の内容を settings.json に追記してください。",
    "",
    JSON.stringify(settings, null, 2),
    "",
    "すでに statusLine がある場合は、置き換えずにコマンドを連結してください。",
    "",
  ].join("\n");
};

// install は「statusline.mts の配置」と「settings.json 用スニペットの生成」という
// flag の on/off とは別の関心事を担う。セットアップを1コマンドに収めるためここに置く。
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
      return NO_STDOUT_OUTPUT;
    case COMMAND_OFF:
      runOff(parseSessionId(rest[0]));
      return NO_STDOUT_OUTPUT;
    case COMMAND_INSTALL:
      if (rest.length > 0) {
        throw new Error("install に引数は指定できません。");
      }
      return runInstall();
    default:
      throw new Error(USAGE);
  }
};

runCli(() => run(process.argv.slice(2)));
