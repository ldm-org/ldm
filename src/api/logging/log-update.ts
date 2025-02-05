import logUpdate from "log-update";

export type LogUpdate = ReturnType<(typeof logUpdate)["create"]>;
export function createNoopLogUpdate(): LogUpdate {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function logUpdate(...text: string[]) {}
  logUpdate.clear = () => {};
  logUpdate.done = () => {};
  return logUpdate;
}
