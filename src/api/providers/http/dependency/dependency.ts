import z from "zod";
import { JSONSerializable } from "@/api/json";
import {
  Dependency,
  DependencySchema,
} from "@/api/models/dependency/dependency";
import { Plan } from "@/api/models/dependency/plan";
import { HTTPVersionSpecifier } from "../version";
import { HTTPMethod, httpMethods } from "../types";
import { HTTPArtifactDownloader } from "../plan";
import { HTTPSource } from "../source";
import { Version } from "@/api/models/version";

export class HTTPDependency
  extends Dependency
  implements JSONSerializable<HTTPDependency.Init>
{
  public readonly url: string;
  public readonly method: HTTPMethod;
  public readonly headers?: HeaderEntry[];
  public readonly params?: Record<string, any>;
  public readonly data?: any;

  get specifier() {
    return new HTTPVersionSpecifier(this.version);
  }

  constructor(properties: HTTPDependencySchema, source: HTTPSource) {
    const parsed = HTTPDependencySchema.parse(properties);
    super(parsed, source, { validate: false });
    this.url = parsed.uri;
    this.method = parsed.method;
    this.headers = parsed.headers;
    this.params = parsed.params;
    this.data = parsed.data;
  }

  getHeaders(): Record<string, string> | undefined {
    return (
      this.headers &&
      Object.fromEntries(this.headers.map(({ key, value }) => [key, value]))
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getLatestVersion(specifier?: HTTPVersionSpecifier | string): Version {
    return new Version("latest");
  }

  plan(): Plan {
    return new Plan([
      new HTTPArtifactDownloader({
        url: this.url,
        method: this.method,
        headers: this.getHeaders(),
        params: this.params,
        data: this.data,
      }),
    ]);
  }

  @JSONSerializable()
  override toJSON() {
    return {
      ...super.toJSON(),
      url: this.url,
      method: this.method,
      headers: this.headers,
      params: this.params,
      data: this.data,
    };
  }
}

const HeaderEntry = z.object({
  key: z.string(),
  value: z.string(),
});

type HeaderEntry = z.infer<typeof HeaderEntry>;

export const HTTPDependencySchema = z.intersection(
  DependencySchema,
  z.object({
    method: z.enum(httpMethods).optional().default("GET"),
    headers: z.array(HeaderEntry).optional(),
    params: z.record(z.any()).optional(),
    data: z.any().optional(),
  }),
);

export type HTTPDependencySchema = z.infer<typeof HTTPDependencySchema>;

export namespace HTTPDependency {
  export interface Init extends Dependency.Init {
    headers?: Record<string, any>;
  }
}
