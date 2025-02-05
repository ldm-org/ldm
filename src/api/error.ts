export class PrintableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrintableError";
  }

  toString() {
    return this.message;
  }
}
