import { lstatSync, type Stats } from "node:fs";

const NOT_FOUND_CODE = "ENOENT";

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

export const isSymlink = (path: string): boolean =>
  lstatOrNull(path)?.isSymbolicLink() ?? false;

export const isRealDirectory = (path: string): boolean => {
  const stats = lstatOrNull(path);
  return stats?.isDirectory() === true && !stats.isSymbolicLink();
};

export const isRealFile = (path: string): boolean => {
  const stats = lstatOrNull(path);
  return stats?.isFile() === true && !stats.isSymbolicLink();
};
