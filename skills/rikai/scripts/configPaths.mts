import { homedir } from "node:os";
import { join, resolve } from "node:path";

const CONFIG_DIR_ENV = "CLAUDE_CONFIG_DIR";
const DEFAULT_CONFIG_DIR_NAME = ".claude";
const RIKAI_DIR_NAME = "rikai";
const ACTIVE_DIR_NAME = "active";

export const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

export const resolveConfigDir = (): string => {
  const fromEnv = process.env[CONFIG_DIR_ENV];
  return resolve(fromEnv ? fromEnv : join(homedir(), DEFAULT_CONFIG_DIR_NAME));
};

export const buildRikaiDir = (): string =>
  join(resolveConfigDir(), RIKAI_DIR_NAME);

export const buildActiveDir = (): string =>
  join(buildRikaiDir(), ACTIVE_DIR_NAME);

export const buildFlagPath = (sessionId: string): string =>
  join(buildActiveDir(), sessionId);
