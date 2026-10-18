const FAILURE_EXIT_CODE = 1;

/**
 * CLI の入口。main の戻り値を標準出力へ書く。
 * 例外が出たら、メッセージを標準エラーへ書いて終了コード 1 で終わる。
 *
 * @param main - 標準出力に書く文字列を返す処理。失敗時は例外を投げる。
 */
export const runCli = (main: () => string): void => {
  try {
    process.stdout.write(main());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(FAILURE_EXIT_CODE);
  }
};
