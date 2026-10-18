const FAILURE_EXIT_CODE = 1;

export const runCli = (main: () => string): void => {
  try {
    process.stdout.write(main());
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exit(FAILURE_EXIT_CODE);
  }
};
