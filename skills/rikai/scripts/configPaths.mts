import { homedir } from "node:os";
import { join, resolve } from "node:path";

const CONFIG_DIR_ENV = "CLAUDE_CONFIG_DIR";
const DEFAULT_CONFIG_DIR_NAME = ".claude";
const RIKAI_DIR_NAME = "rikai";
const ACTIVE_DIR_NAME = "active";

/**
 * Claude Code の設定ディレクトリを絶対パスで返す。
 * `CLAUDE_CONFIG_DIR` があればそれを使い、無ければ `~/.claude` を使う。
 *
 * @returns 設定ディレクトリの絶対パス
 */
export const resolveConfigDir = (): string => {
  const fromEnv = process.env[CONFIG_DIR_ENV];
  return resolve(fromEnv ? fromEnv : join(homedir(), DEFAULT_CONFIG_DIR_NAME));
};

/**
 * rikai 用ディレクトリ（設定ディレクトリ直下の `rikai/`）のパスを返す。
 *
 * @returns rikai ディレクトリの絶対パス
 */
export const buildRikaiDir = (): string =>
  join(resolveConfigDir(), RIKAI_DIR_NAME);

/**
 * セッションごとのフラグを置くディレクトリ（`rikai/active/`）のパスを返す。
 *
 * @returns active ディレクトリの絶対パス
 */
export const buildActiveDir = (): string =>
  join(buildRikaiDir(), ACTIVE_DIR_NAME);

/**
 * セッションのフラグファイルのパスを返す。
 *
 * @param sessionId - セッション ID。呼び出し側で `parseSessionId` を通しておく。
 * @returns フラグファイルの絶対パス
 */
export const buildFlagPath = (sessionId: string): string =>
  join(buildActiveDir(), sessionId);
