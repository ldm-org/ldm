import { findUpSync } from "find-up";
import { dirname, join } from "path";
import { exec, ExecException, ExecOptions } from "child_process";

const WORKSPACE_ROOT = dirname(findUpSync("package.json")!);
const binPath = join(WORKSPACE_ROOT, "bin/cli.js");

export function ldm(
  command: string,
  options?: ExecOptions & { verbose?: boolean },
  callback?: Callback,
) {
  return run({
    command: `${binPath} ${command}`,
    options,
    callback,
  });
}

type Callback = (
  error: ExecException | null,
  stdout: string | Buffer<ArrayBufferLike>,
  stderr: string | Buffer<ArrayBufferLike>,
) => void;

function run(opts: {
  command: string;
  options?: ExecOptions & { verbose?: boolean };
  callback?: (
    error: ExecException | null,
    stdout: string | Buffer<ArrayBufferLike>,
    stderr: string | Buffer<ArrayBufferLike>,
  ) => void;
}) {
  const { command, options, callback } = opts;
  return new Promise<void>((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      callback?.(error, stdout, stderr);
      if (error) {
        console.error(stderr);
        reject(error);
      }
      if (options?.verbose) {
        console.log(stdout);
      }
      resolve();
    });
  });
}
