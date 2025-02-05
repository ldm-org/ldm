import { readFileSync, rmSync } from "fs";
import { readFile, rm } from "fs/promises";

export async function rmtree(path: string) {
  await rm(path, { recursive: true, force: true });
}

export async function rmtreeSync(path: string) {
  rmSync(path, { recursive: true, force: true });
}

export async function readFileOrNull(
  path: string,
  encoding: "utf-8" | "utf8",
): Promise<string | null>;
export async function readFileOrNull(
  path: string,
  encoding?: BufferEncoding,
): Promise<string | Buffer | null> {
  try {
    return await readFile(path, encoding);
  } catch {
    return null;
  }
}

export function readFileOrNullSync(
  path: string,
  encoding: "utf-8" | "utf8",
): string | null;
export function readFileOrNullSync(
  path: string,
  encoding?: BufferEncoding,
): string | Buffer | null {
  try {
    return readFileSync(path, encoding);
  } catch {
    return null;
  }
}
