import { rmSync } from "fs";
import { rm } from "fs/promises";

export async function rmtree(path: string) {
  await rm(path, { recursive: true, force: true });
}

export async function rmtreeSync(path: string) {
  rmSync(path, { recursive: true, force: true });
}
