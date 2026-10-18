import {
  existsSync,
  lstatSync,
  mkdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import {
  ACTIVE_DIR_NAME,
  buildActiveDir,
  buildCopyPath,
  buildFlagPath,
  buildRejectedResult,
  buildRikaiDir,
  cleanupTempDirs,
  createFlagResult,
  createSnapshot,
  createTempDir,
  SESSION_ID,
  SUCCESS_RESULT,
  SYMLINK_REASON,
} from "./helpers/scriptTestHelpers.mts";

afterEach(cleanupTempDirs);

const TARGET_CONTENT = "link-target-content";
const FLAG_TARGET_NAME = "flag-target";
const COPY_TARGET_NAME = "copy-target";
const SENTINEL_NAME = "sentinel";
const DANGLING_TARGET_NAME = "dangling-target";

type Layout = { linkPath: string; targetPath: string };
type LayoutBuilder = (configDir: string, link: boolean) => Layout;

// rikai/ を symlink にする。link が false なら同じ中身の本物のディレクトリにする。
const buildRikaiSymlinkLayout: LayoutBuilder = (configDir, link) => {
  const targetPath = createTempDir();
  mkdirSync(join(targetPath, ACTIVE_DIR_NAME));
  writeFileSync(join(targetPath, ACTIVE_DIR_NAME, SESSION_ID), TARGET_CONTENT);
  const linkPath = buildRikaiDir(configDir);
  if (link) {
    symlinkSync(targetPath, linkPath);
  } else {
    mkdirSync(buildActiveDir(configDir), { recursive: true });
    writeFileSync(buildFlagPath(configDir, SESSION_ID), TARGET_CONTENT);
  }
  return { linkPath, targetPath };
};

// active/ を symlink にする。link が false なら同じ中身の本物のディレクトリにする。
const buildActiveSymlinkLayout: LayoutBuilder = (configDir, link) => {
  const targetPath = join(createTempDir(), ACTIVE_DIR_NAME);
  mkdirSync(targetPath);
  writeFileSync(join(targetPath, SESSION_ID), TARGET_CONTENT);
  const linkPath = buildActiveDir(configDir);
  mkdirSync(buildRikaiDir(configDir), { recursive: true });
  if (link) {
    symlinkSync(targetPath, linkPath);
  } else {
    mkdirSync(linkPath);
    writeFileSync(buildFlagPath(configDir, SESSION_ID), TARGET_CONTENT);
  }
  return { linkPath, targetPath };
};

// フラグファイルを symlink にする。link が false なら本物のファイルにする。
const buildFlagSymlinkLayout: LayoutBuilder = (configDir, link) => {
  const targetPath = join(createTempDir(), FLAG_TARGET_NAME);
  writeFileSync(targetPath, TARGET_CONTENT);
  const linkPath = buildFlagPath(configDir, SESSION_ID);
  mkdirSync(buildActiveDir(configDir), { recursive: true });
  if (link) {
    symlinkSync(targetPath, linkPath);
  } else {
    writeFileSync(linkPath, TARGET_CONTENT);
  }
  return { linkPath, targetPath };
};

// リンク先が存在しない symlink をフラグの位置に置く。
const buildDanglingFlagLayout: LayoutBuilder = (configDir) => {
  const targetPath = join(createTempDir(), DANGLING_TARGET_NAME);
  const linkPath = buildFlagPath(configDir, SESSION_ID);
  mkdirSync(buildActiveDir(configDir), { recursive: true });
  symlinkSync(targetPath, linkPath);
  return { linkPath, targetPath };
};

type InstallLayoutBuilder = (configDir: string) => Layout;

const buildRikaiDirInstallLayout: InstallLayoutBuilder = (configDir) => {
  const targetPath = createTempDir();
  writeFileSync(join(targetPath, SENTINEL_NAME), TARGET_CONTENT);
  const linkPath = buildRikaiDir(configDir);
  symlinkSync(targetPath, linkPath);
  return { linkPath, targetPath };
};

const buildCopyPathInstallLayout: InstallLayoutBuilder = (configDir) => {
  const targetPath = join(createTempDir(), COPY_TARGET_NAME);
  writeFileSync(targetPath, TARGET_CONTENT);
  mkdirSync(buildRikaiDir(configDir), { recursive: true });
  const linkPath = buildCopyPath(configDir);
  symlinkSync(targetPath, linkPath);
  return { linkPath, targetPath };
};

const buildDanglingCopyPathInstallLayout: InstallLayoutBuilder = (
  configDir,
) => {
  const targetPath = join(createTempDir(), DANGLING_TARGET_NAME);
  mkdirSync(buildRikaiDir(configDir), { recursive: true });
  const linkPath = buildCopyPath(configDir);
  symlinkSync(targetPath, linkPath);
  return { linkPath, targetPath };
};

const SYMLINK_LAYOUTS: { kind: string; buildLayout: LayoutBuilder }[] = [
  { kind: "rikai", buildLayout: buildRikaiSymlinkLayout },
  { kind: "active", buildLayout: buildActiveSymlinkLayout },
  { kind: "flag", buildLayout: buildFlagSymlinkLayout },
];

const COMMANDS = ["on", "off"];

describe("flag symlink", () => {
  describe("正常系", () => {
    test.each(
      COMMANDS.flatMap((command) =>
        SYMLINK_LAYOUTS.map((layout) => ({
          command,
          shouldExist: command === "on",
          ...layout,
        })),
      ),
    )(
      "対照: $command は $kind が symlink でなければ成功する",
      ({ command, shouldExist, buildLayout }) => {
        // Arrange
        const configDir = createTempDir();
        buildLayout(configDir, false);

        // Act
        const result = createFlagResult([command, SESSION_ID], { configDir });

        // Assert
        expect(result).toStrictEqual(SUCCESS_RESULT);
        expect(existsSync(buildFlagPath(configDir, SESSION_ID))).toBe(
          shouldExist,
        );
      },
    );
  });

  describe("異常系", () => {
    test.each(
      COMMANDS.flatMap((command) =>
        [
          ...SYMLINK_LAYOUTS,
          { kind: "リンク先が無い flag", buildLayout: buildDanglingFlagLayout },
        ].map((layout) => ({ command, ...layout })),
      ),
    )(
      "$command は $kind が symlink なら拒否し、リンク先を変えない",
      ({ command, buildLayout }) => {
        // Arrange
        const configDir = createTempDir();
        const { linkPath, targetPath } = buildLayout(configDir, true);
        const before = createSnapshot(targetPath);

        // Act
        const result = createFlagResult([command, SESSION_ID], { configDir });

        // Assert
        expect(result).toStrictEqual(buildRejectedResult(SYMLINK_REASON));
        expect(createSnapshot(targetPath)).toStrictEqual(before);
        expect(lstatSync(linkPath).isSymbolicLink()).toBe(true);
      },
    );

    test.each([
      { kind: "rikai/", buildLayout: buildRikaiDirInstallLayout },
      { kind: "コピー先", buildLayout: buildCopyPathInstallLayout },
      {
        kind: "リンク先が無いコピー先",
        buildLayout: buildDanglingCopyPathInstallLayout,
      },
    ])(
      "install は $kind が symlink なら拒否し、リンク先を変えない",
      ({ buildLayout }) => {
        // Arrange
        const configDir = createTempDir();
        const { linkPath, targetPath } = buildLayout(configDir);
        const before = createSnapshot(targetPath);

        // Act
        const result = createFlagResult(["install"], { configDir });

        // Assert
        expect(result).toStrictEqual(buildRejectedResult(SYMLINK_REASON));
        expect(createSnapshot(targetPath)).toStrictEqual(before);
        expect(lstatSync(linkPath).isSymbolicLink()).toBe(true);
      },
    );
  });
});
