import { lstatSync, type Stats } from "node:fs";

const NOT_FOUND_CODE = "ENOENT";

/**
 * symlink をたどらずに `lstat` する。パスが無ければ `undefined` を返す。
 *
 * @param path - 調べるパス
 * @returns `Stats`。パスが存在しなければ `undefined`
 * @throws ENOENT 以外の `lstat` のエラーはそのまま投げる。
 */
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

/**
 * パス自体が symlink かを返す。リンク先が無い symlink も true。
 *
 * @param path - 調べるパス
 * @returns symlink なら true。パスが無ければ false
 */
export const isSymlink = (path: string): boolean =>
  lstatOrNull(path)?.isSymbolicLink() ?? false;

/**
 * パスが symlink ではない実体のディレクトリかを返す。
 *
 * @param path - 調べるパス
 * @returns 実体のディレクトリなら true
 */
export const isRealDirectory = (path: string): boolean => {
  const stats = lstatOrNull(path);
  return stats?.isDirectory() === true && !stats.isSymbolicLink();
};

/**
 * パスが symlink ではない実体の通常ファイルかを返す。
 *
 * @param path - 調べるパス
 * @returns 実体の通常ファイルなら true
 */
export const isRealFile = (path: string): boolean => {
  const stats = lstatOrNull(path);
  return stats?.isFile() === true && !stats.isSymbolicLink();
};
