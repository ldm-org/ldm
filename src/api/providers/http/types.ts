export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export function isHTTPMethod(value: string): value is HTTPMethod {
  return ["GET", "POST", "PUT", "DELETE", "PATCH"].includes(value);
}

export const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
