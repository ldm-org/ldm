import { PrintableError } from "@/api/error";

export class FrozenLockfileError extends PrintableError {
  constructor(message?: string) {
    super(
      message ||
        "The lockfile is not up to date while `--frozen-lockfile` is enabled. " +
          "Please run `ldm install` without `--frozen-lockfile` to update the lockfile.",
    );
  }
}
