import { PrintableError } from "@/api/error";

export class ForbiddenExplicitHTTPSource extends PrintableError {
  constructor(message?: string) {
    super(message ?? "HTTP source is not allowed to specify explicitly.");
  }
}
