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

/**
 * 引数の session_id を検証して返す。
 *
 * @param raw - コマンドライン引数の session_id
 * @returns 検証済みの session_id
 * @throws 未指定、または英数字・ハイフン・アンダースコア以外を含むとき
 */
const parseSessionId = (raw: string | undefined): string => {
  if (raw === undefined || !SESSION_ID_PATTERN.test(raw)) {
    throw new Error(
      `session_id は英数字・ハイフン・アンダースコアのみ指定できます: "${raw ?? ""}"`,
    );
  }
  return raw;
};

/**
 * パスが symlink なら例外を投げる。リンク先が無い symlink も対象。
 *
 * @param path - 調べるパス
 * @throws パスが symlink のとき
 */
const assertNotSymlink = (path: string): void => {
  if (isSymlink(path)) {
    throw new Error(`symlink は扱えません: ${path}`);
  }
};

/**
 * フラグファイルのパスを返す。途中の `rikai/` と `active/` が symlink なら拒否する。
 *
 * @param sessionId - 検証済みの session_id
 * @returns フラグファイルの絶対パス
 * @throws `rikai/` か `active/` が symlink のとき
 */
const resolveFlagPath = (sessionId: string): string => {
  const activeDir = buildActiveDir();
  assertNotSymlink(buildRikaiDir());
  assertNotSymlink(activeDir);
  return buildFlagPath(sessionId);
};

/**
 * `on`: セッションのフラグファイルを作る。必要なら `active/` も作る。
 *
 * @param sessionId - 検証済みの session_id
 * @throws パス上のいずれかが symlink のとき
 */
const runOn = (sessionId: string): void => {
  const flagPath = resolveFlagPath(sessionId);
  mkdirSync(buildActiveDir(), { recursive: true });
  // symlink チェックと書き込みの間に別プロセスが差し替える可能性は残る（TOCTOU）。
  // ローカル開発環境での単一ユーザー利用を前提に許容している。
  assertNotSymlink(flagPath);
  writeFileSync(flagPath, FLAG_FILE_CONTENT);
};

/**
 * `off`: セッションのフラグファイルを削除する。無ければ何もしない。
 *
 * @param sessionId - 検証済みの session_id
 * @throws パス上のいずれかが symlink のとき
 */
const runOff = (sessionId: string): void => {
  const flagPath = resolveFlagPath(sessionId);
  assertNotSymlink(flagPath);
  rmSync(flagPath, { force: true });
};

/**
 * settings.json に追記する statusLine のスニペットと案内文を組み立てる。
 *
 * @param copyPath - コピーした statusline.mts の絶対パス
 * @returns 標準出力に出す案内文（JSON スニペットを含む）
 */
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

/**
 * `install`: statusline.mts を `rikai/` にコピーし、追記用スニペットを返す。
 * コピー先が既にあれば上書きする。settings.json は読み書きしない。
 *
 * 配置とスニペット生成は flag の on/off とは別の関心事だが、
 * セットアップを1コマンドに収めるためここに置く。
 *
 * @returns 標準出力に出す案内文
 * @throws `rikai/` かコピー先が symlink のとき
 */
const runInstall = (): string => {
  const rikaiDir = buildRikaiDir();
  const copyPath = join(rikaiDir, STATUSLINE_NAME);
  assertNotSymlink(rikaiDir);
  mkdirSync(rikaiDir, { recursive: true });
  assertNotSymlink(copyPath);
  copyFileSync(join(import.meta.dirname, STATUSLINE_NAME), copyPath);
  return buildSnippet(copyPath);
};

/**
 * サブコマンドを振り分けて実行する。
 *
 * @param args - `process.argv` のスクリプト名以降。先頭がサブコマンド
 * @returns 標準出力に出す文字列。`on`・`off` は空文字
 * @throws 未知のサブコマンド、不正な引数、または各処理の失敗
 */
const run = (args: string[]): string => {
  const [command, ...rest] = args;
  const [sessionIdArg] = rest;
  switch (command) {
    case COMMAND_ON:
      runOn(parseSessionId(sessionIdArg));
      return NO_STDOUT_OUTPUT;
    case COMMAND_OFF:
      runOff(parseSessionId(sessionIdArg));
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
