import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";
import { zipSync } from "fflate";

const REPO_ROOT = resolve(import.meta.dirname, "..");
const DEFAULT_OUT_PATH = resolve(REPO_ROOT, "rikai.zip");
const DEFAULT_SKILL_PATH = resolve(REPO_ROOT, "skills/rikai/SKILL.md");
const ZIP_ENTRY_PATH = "rikai/SKILL.md";
const FAILURE_EXIT_CODE = 1;
const MAX_ARG_COUNT = 2;
const OPTION_PREFIX = "-";
const ZIP_EXTENSION = ".zip";

/**
 * コマンドライン引数から、出力先と入力のパスを取り出す。
 *
 * @param args - 出力先と入力を順に2個まで含む引数
 * @returns 出力先と入力のパス。省略分は既定のパス
 * @throws 引数が3個以上のとき、`-` で始まる引数があるとき、または出力先の拡張子が `.zip` 以外のとき
 */
const parseArgs = (args: string[]): { outPath: string; skillPath: string } => {
  if (args.length > MAX_ARG_COUNT) {
    throw new Error("引数は出力先と入力の2個までです。");
  }
  const optionLikeArg = args.find((arg) => arg.startsWith(OPTION_PREFIX));
  if (optionLikeArg !== undefined) {
    throw new Error(`- で始まる引数は使えません: "${optionLikeArg}"`);
  }
  const [outPath = DEFAULT_OUT_PATH, skillPath = DEFAULT_SKILL_PATH] = args;
  if (extname(outPath).toLowerCase() !== ZIP_EXTENSION) {
    throw new Error(
      `出力先の拡張子は ${ZIP_EXTENSION} に限ります: "${outPath}"`,
    );
  }
  return { outPath, skillPath };
};

/**
 * 出力先と入力が同じファイルに解決されないことを確かめる。
 * 存在しない出力先は入力と同じファイルになりえないため、解決を省く。
 *
 * @param outPath - 出力先のパス
 * @param skillPath - 入力のパス。存在するファイルに限る
 * @throws 出力先と入力が同じファイルに解決されるとき
 */
const assertDifferentFiles = (outPath: string, skillPath: string): void => {
  if (
    existsSync(outPath) &&
    realpathSync(outPath) === realpathSync(skillPath)
  ) {
    throw new Error(`出力先と入力が同じファイルです: "${skillPath}"`);
  }
};

/**
 * `SKILL.md` のバイト列を、配布用の ZIP に固める。
 *
 * @param skillBytes - `SKILL.md` のバイト列
 * @returns ZIP のバイト列
 */
const buildSkillZip = (skillBytes: Uint8Array): Uint8Array =>
  zipSync({ [ZIP_ENTRY_PATH]: skillBytes });

/**
 * 配布用の ZIP を生成する。
 *
 * 使い方: `node scripts/build-zip.mts [outPath] [skillPath]`
 *
 * 既定の出力先はリポジトリ直下の `rikai.zip`、既定の入力は `skills/rikai/SKILL.md`。
 * 引数が3個以上のとき、`-` で始まる引数があるとき、出力先の拡張子が `.zip` 以外のとき（大文字小文字は区別しない）、出力先と入力が同じファイルのときは拒否する。
 * 失敗したら、メッセージを標準エラーへ書いて終了コード 1 で終わる。
 * 検証と読み取りは書き込みより先に行う。検証や読み取りに失敗しても、出力先は変わらない。書き込み中の失敗は対象外。
 */
try {
  const { outPath, skillPath } = parseArgs(process.argv.slice(2));
  const skillBytes = readFileSync(skillPath);
  assertDifferentFiles(outPath, skillPath);
  writeFileSync(outPath, buildSkillZip(skillBytes));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(FAILURE_EXIT_CODE);
}
