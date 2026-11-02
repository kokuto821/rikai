import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { unzipSync } from "fflate";
import { afterEach, describe, expect, test } from "vitest";
import {
  BUILD_ZIP_SCRIPT_PATH,
  buildRejectedResult,
  cleanupTempDirs,
  createBuildZipResult,
  createScriptResult,
  createSnapshot,
  createTempDir,
  type ScriptResult,
  SUCCESS_EXIT_CODE,
  SUCCESS_RESULT,
} from "./helpers/scriptTestHelpers.mts";

afterEach(cleanupTempDirs);

const ZIP_ENTRY_PATH = "rikai/SKILL.md";
const OUT_FILE_NAME = "rikai.zip";
const SKILL_FILE_NAME = "SKILL.md";
const MISSING_SKILL_FILE_NAME = "missing-SKILL.md";
const NODE_MODULES_DIR_NAME = "node_modules";
const REPO_NODE_MODULES_PATH = resolve(
  import.meta.dirname,
  `../${NODE_MODULES_DIR_NAME}`,
);
const COPIED_SCRIPT_RELATIVE_PATH = "scripts/build-zip.mts";
const COPIED_SKILL_RELATIVE_PATH = "skills/rikai/SKILL.md";
const REPO_SKILL_PATH = resolve(
  import.meta.dirname,
  `../${COPIED_SKILL_RELATIVE_PATH}`,
);
const REPO_ZIP_PATH = resolve(import.meta.dirname, `../${OUT_FILE_NAME}`);
const OUT_SYMLINK_NAME = "out-link.zip";
const SAME_ZIP_FILE_NAME = "same.zip";
const OTHER_MD_FILE_NAME = "other.md";
const EXISTING_MD_FILE_NAME = "existing.md";
const DOUBLE_EXTENSION_FILE_NAME = "rikai.zip.md";
const UPPERCASE_ZIP_FILE_NAMES = ["rikai.ZIP", "rikai.Zip"];
const MISSING_NON_ZIP_FILE_NAMES = ["out.txt", "archive"];
const EXTRA_ARG = "extra";
const OPTION_ARG = "--help";
const OPTION_LIKE_ARGS = [OPTION_ARG, "-o", "-"];
const STACK_TRACE_LINE_PATTERN = /^\s+at /m;

// 文字列を経由して読み書きすると内容が変わるバイト列。マルチバイト文字、CRLF、UTF-8 として不正な 0xff を含む。
const SKILL_BYTES = new Uint8Array([
  ...new TextEncoder().encode("---\nname: rikai\n---\r\n理解度の確認\n"),
  0xff,
  0x00,
]);
// ZIP として解釈できず、生成される ZIP より長いバイト列。追記と切り詰め漏れの検出用。
const UNRELATED_BYTES = new Uint8Array(4096).fill(0xab);

/**
 * ファイルをバイト列として読み込む。
 * Buffer のまま渡すと、エントリと期待値の型が食い違う恐れがあるため Uint8Array に変換。
 *
 * @param filePath - 読み込むファイルのパス
 * @returns ファイルの内容
 */
const readFileBytes = (filePath: string): Uint8Array =>
  new Uint8Array(readFileSync(filePath));

/**
 * ZIP ファイルを読み込み、展開したエントリを返す。
 *
 * @param zipPath - 読み込む ZIP ファイルのパス
 * @returns ZIP 内のパスをキーとするエントリの内容
 */
const readZipEntries = (zipPath: string): Record<string, Uint8Array> =>
  unzipSync(readFileBytes(zipPath));

/**
 * リポジトリと同じ構成の一時ディレクトリを作る。
 * 既定の出力先がリポジトリ直下の `rikai.zip` を書き換えないよう、スクリプトはコピーを使う。
 *
 * @param skillBytes - フィクスチャの `SKILL.md` に書き込むバイト列
 * @returns 一時ディレクトリの直下とコピーしたスクリプトのパス
 */
const createRepoLayout = (
  skillBytes: Uint8Array,
): { repoRoot: string; scriptPath: string } => {
  const repoRoot = createTempDir();
  const scriptPath = join(repoRoot, COPIED_SCRIPT_RELATIVE_PATH);
  const skillPath = join(repoRoot, COPIED_SKILL_RELATIVE_PATH);
  mkdirSync(dirname(scriptPath), { recursive: true });
  mkdirSync(dirname(skillPath), { recursive: true });
  copyFileSync(BUILD_ZIP_SCRIPT_PATH, scriptPath);
  writeFileSync(skillPath, skillBytes);
  symlinkSync(REPO_NODE_MODULES_PATH, join(repoRoot, NODE_MODULES_DIR_NAME));
  return { repoRoot, scriptPath };
};

/**
 * 一時ディレクトリのフィクスチャから ZIP を生成し、展開したエントリを返す。
 * スクリプトの失敗は、原因が読めるよう標準エラーつきで例外にする。
 *
 * @param skillBytes - フィクスチャの `SKILL.md` に書き込むバイト列
 * @returns ZIP 内のパスをキーとするエントリの内容
 */
const createZipEntries = (
  skillBytes: Uint8Array,
): Record<string, Uint8Array> => {
  const tempDir = createTempDir();
  const skillPath = join(tempDir, SKILL_FILE_NAME);
  const outPath = join(tempDir, OUT_FILE_NAME);
  writeFileSync(skillPath, skillBytes);

  const result = createBuildZipResult([outPath, skillPath]);
  if (result.status !== SUCCESS_EXIT_CODE) {
    throw new Error(`build-zip の実行に失敗: ${result.stderr}`);
  }

  return readZipEntries(outPath);
};

/**
 * 拒否された結果であり、標準エラーにスタックトレースがないことを検証する。
 *
 * @param result - スクリプトの実行結果
 * @param reason - 標準エラーに含まれるべき文字列。省略すると含有を問わない
 */
const expectRejected = (result: ScriptResult, reason?: string): void => {
  expect(result).toStrictEqual(buildRejectedResult(reason));
  expect(result.stderr).not.toMatch(STACK_TRACE_LINE_PATTERN);
};

describe("build-zip", () => {
  describe("正常系", () => {
    test("生成した ZIP のエントリは rikai/SKILL.md だけで、内容が元のファイルとバイト単位で一致する", () => {
      // Arrange
      const expected = { [ZIP_ENTRY_PATH]: SKILL_BYTES };

      // Act
      const entries = createZipEntries(SKILL_BYTES);

      // Assert
      expect(entries).toStrictEqual(expected);
    });

    test("引数なしで実行すると、スクリプトから見たリポジトリ直下に rikai.zip を生成する", () => {
      // Arrange
      const { repoRoot, scriptPath } = createRepoLayout(SKILL_BYTES);
      const cwd = createTempDir();
      const expected = { [ZIP_ENTRY_PATH]: SKILL_BYTES };

      // Act
      const result = createScriptResult(scriptPath, [], { cwd });

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(readZipEntries(join(repoRoot, OUT_FILE_NAME))).toStrictEqual(
        expected,
      );
      expect(existsSync(join(cwd, OUT_FILE_NAME))).toBe(false);
    });

    test("outPath だけを渡すと、実物の skills/rikai/SKILL.md から outPath に ZIP を生成し、リポジトリ直下の rikai.zip を変えない", () => {
      // Arrange
      const outPath = join(createTempDir(), OUT_FILE_NAME);
      const expected = { [ZIP_ENTRY_PATH]: readFileBytes(REPO_SKILL_PATH) };
      const repoZipBefore = createSnapshot(REPO_ZIP_PATH);

      // Act
      const result = createBuildZipResult([outPath]);

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(readZipEntries(outPath)).toStrictEqual(expected);
      expect(createSnapshot(REPO_ZIP_PATH)).toStrictEqual(repoZipBefore);
    });

    test("outPath に無関係なバイト列があると、追記せず上書きして期待どおりの ZIP にする", () => {
      // Arrange
      const tempDir = createTempDir();
      const outPath = join(tempDir, OUT_FILE_NAME);
      const skillPath = join(tempDir, SKILL_FILE_NAME);
      writeFileSync(outPath, UNRELATED_BYTES);
      writeFileSync(skillPath, SKILL_BYTES);
      const expected = { [ZIP_ENTRY_PATH]: SKILL_BYTES };

      // Act
      const result = createBuildZipResult([outPath, skillPath]);

      // Assert
      expect(result).toStrictEqual(SUCCESS_RESULT);
      expect(readZipEntries(outPath)).toStrictEqual(expected);
      // 末尾に残ったバイト列は展開で検出できないため、サイズで照合。
      expect(readFileBytes(outPath).length).toBeLessThan(
        UNRELATED_BYTES.length,
      );
    });

    test.each(UPPERCASE_ZIP_FILE_NAMES)(
      "出力先の拡張子は大文字小文字を区別せず、%s を受け付ける",
      (outFileName) => {
        // Arrange
        const tempDir = createTempDir();
        const outPath = join(tempDir, outFileName);
        const skillPath = join(tempDir, SKILL_FILE_NAME);
        writeFileSync(skillPath, SKILL_BYTES);
        const expected = { [ZIP_ENTRY_PATH]: SKILL_BYTES };

        // Act
        const result = createBuildZipResult([outPath, skillPath]);

        // Assert
        expect(result).toStrictEqual(SUCCESS_RESULT);
        expect(readZipEntries(outPath)).toStrictEqual(expected);
      },
    );
  });

  describe("異常系", () => {
    test("skillPath が存在しないと終了コード 1 で失敗し、一時ファイルも含めて何も残さず、スタックトレースなしのメッセージを出す", () => {
      // Arrange
      const tempDir = createTempDir();
      const outPath = join(tempDir, OUT_FILE_NAME);
      const skillPath = join(tempDir, MISSING_SKILL_FILE_NAME);

      // Act
      const result = createBuildZipResult([outPath, skillPath]);

      // Assert
      expectRejected(result, skillPath);
      expect(readdirSync(tempDir)).toStrictEqual([]);
    });

    // 拡張子の検証で先に拒否されないよう、出力先はどのケースも .zip の名前。
    test.each([
      {
        name: "両方とも絶対パス",
        inputFileName: SAME_ZIP_FILE_NAME,
        createArgs: (tempDir: string) => [
          join(tempDir, SAME_ZIP_FILE_NAME),
          join(tempDir, SAME_ZIP_FILE_NAME),
        ],
      },
      {
        name: "出力先だけ相対パス",
        inputFileName: SAME_ZIP_FILE_NAME,
        createArgs: (tempDir: string) => [
          SAME_ZIP_FILE_NAME,
          join(tempDir, SAME_ZIP_FILE_NAME),
        ],
      },
      {
        name: "入力だけ相対パス",
        inputFileName: SAME_ZIP_FILE_NAME,
        createArgs: (tempDir: string) => [
          join(tempDir, SAME_ZIP_FILE_NAME),
          `./${SAME_ZIP_FILE_NAME}`,
        ],
      },
      {
        name: "出力先が入力への .zip という名前のシンボリックリンク",
        inputFileName: SKILL_FILE_NAME,
        createArgs: (tempDir: string) => {
          const skillPath = join(tempDir, SKILL_FILE_NAME);
          const linkPath = join(tempDir, OUT_SYMLINK_NAME);
          symlinkSync(skillPath, linkPath);
          return [linkPath, skillPath];
        },
      },
    ])(
      "出力先と入力が同じファイルに解決される（$name）と終了コード 1 で失敗し、入力ファイルの内容を変えない",
      ({ inputFileName, createArgs }) => {
        // Arrange
        const tempDir = createTempDir();
        const inputPath = join(tempDir, inputFileName);
        writeFileSync(inputPath, SKILL_BYTES);
        const args = createArgs(tempDir);

        // Act
        const result = createBuildZipResult(args, { cwd: tempDir });

        // Assert
        // パスの表示形式（相対・絶対）を限定しないよう、ファイル名で照合。
        expectRejected(result, inputFileName);
        expect(readFileBytes(inputPath)).toStrictEqual(SKILL_BYTES);
      },
    );

    test.each([
      {
        name: "引数の入れ替えで、入力も出力先も別の既存ファイル",
        outFileName: SKILL_FILE_NAME,
        inputFileName: OTHER_MD_FILE_NAME,
      },
      {
        name: "引数の入れ替えで、入力が既存の ZIP",
        outFileName: SKILL_FILE_NAME,
        inputFileName: OUT_FILE_NAME,
      },
      {
        name: "途中に .zip を含むが、末尾の拡張子が別",
        outFileName: DOUBLE_EXTENSION_FILE_NAME,
        inputFileName: OTHER_MD_FILE_NAME,
      },
    ])(
      "出力先の拡張子が .zip でない（$name）と終了コード 1 で失敗し、出力先のファイル名を示して、どちらのファイルも変えない",
      ({ outFileName, inputFileName }) => {
        // Arrange
        const tempDir = createTempDir();
        const outPath = join(tempDir, outFileName);
        const inputPath = join(tempDir, inputFileName);
        writeFileSync(outPath, SKILL_BYTES);
        writeFileSync(inputPath, UNRELATED_BYTES);

        // Act
        const result = createBuildZipResult([outPath, inputPath]);

        // Assert
        expectRejected(result, outFileName);
        expect(readFileBytes(outPath)).toStrictEqual(SKILL_BYTES);
        expect(readFileBytes(inputPath)).toStrictEqual(UNRELATED_BYTES);
      },
    );

    test("単独の引数で既存の .md を渡すと終了コード 1 で失敗し、ファイル名を示して内容を変えない", () => {
      // Arrange
      const outPath = join(createTempDir(), EXISTING_MD_FILE_NAME);
      writeFileSync(outPath, SKILL_BYTES);

      // Act
      const result = createBuildZipResult([outPath]);

      // Assert
      expectRejected(result, EXISTING_MD_FILE_NAME);
      expect(readFileBytes(outPath)).toStrictEqual(SKILL_BYTES);
    });

    test.each(MISSING_NON_ZIP_FILE_NAMES)(
      "存在しない出力先の拡張子が .zip でない（%s）と終了コード 1 で失敗し、ファイルを作らない",
      (outFileName) => {
        // Arrange
        const tempDir = createTempDir();
        const outPath = join(tempDir, outFileName);
        const skillPath = join(tempDir, SKILL_FILE_NAME);
        writeFileSync(skillPath, SKILL_BYTES);

        // Act
        const result = createBuildZipResult([outPath, skillPath]);

        // Assert
        expectRejected(result, outFileName);
        expect(existsSync(outPath)).toBe(false);
      },
    );

    test.each(OPTION_LIKE_ARGS)(
      "出力先に - で始まる引数（%s）を渡すと終了コード 1 で失敗し、その名前のファイルを作らない",
      (arg) => {
        // Arrange
        const cwd = createTempDir();

        // Act
        const result = createBuildZipResult([arg], { cwd });

        // Assert
        expectRejected(result);
        expect(readdirSync(cwd)).toStrictEqual([]);
      },
    );

    test("入力に - で始まる引数を渡すと、同名のファイルがあっても終了コード 1 で失敗し、outPath を作らない", () => {
      // Arrange
      const cwd = createTempDir();
      const outPath = join(cwd, OUT_FILE_NAME);
      writeFileSync(join(cwd, OPTION_ARG), SKILL_BYTES);

      // Act
      const result = createBuildZipResult([outPath, OPTION_ARG], { cwd });

      // Assert
      expectRejected(result);
      expect(existsSync(outPath)).toBe(false);
    });

    test("引数が 3 個あると終了コード 1 で失敗し、outPath にファイルを残さない", () => {
      // Arrange
      const tempDir = createTempDir();
      const outPath = join(tempDir, OUT_FILE_NAME);
      const skillPath = join(tempDir, SKILL_FILE_NAME);
      writeFileSync(skillPath, SKILL_BYTES);

      // Act
      const result = createBuildZipResult([outPath, skillPath, EXTRA_ARG]);

      // Assert
      expectRejected(result);
      expect(existsSync(outPath)).toBe(false);
    });
  });
});
