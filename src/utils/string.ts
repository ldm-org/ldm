export function indent(spaces: number) {
  return (str: string) =>
    str
      .split("\n")
      .map(line => " ".repeat(spaces) + line)
      .join("\n");
}
