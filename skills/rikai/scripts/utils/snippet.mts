/**
 * settings.json に追記する statusLine のスニペットと案内文を組み立てる。
 *
 * @param copyPath - コピーした statusline.mts の絶対パス
 * @returns 標準出力に出す案内文（JSON スニペットを含む）
 */
export const buildSnippet = (copyPath: string): string => {
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
