import { z } from "zod";
import {
  Dependency,
  DependencySchema,
} from "@/api/models/dependency/dependency";
import { PrintableError } from "@/api/error";
import { JSDelivrSource } from "../source";
import { JSONSerializable } from "@/api/json";
import { HTTPArtifactDownloader } from "../../http/plan";

export abstract class JSDelivrDependency extends Dependency {
  declare public readonly source: JSDelivrSource;
  public readonly shouldMinify: boolean;

  constructor(properties: JSDelivrDependencySchema, source: JSDelivrSource) {
    const parsed = JSDelivrDependencySchema.parse(properties);
    super(parsed, source, { validate: false });
    this.shouldMinify = parsed.minify;
    if (
      this.shouldMinify &&
      !(this.path.endsWith(".css") || this.path.endsWith(".js"))
    ) {
      throw new PrintableError(
        `Minify is only supported for CSS and JS files, but got ${this.path}`,
      );
    }
  }

  minify(artifacts: HTTPArtifactDownloader[]) {
    if (artifacts.length !== 1) {
      throw new PrintableError(
        `Minify is only supported for a file, but got a directory`,
      );
    }
    const [artifact] = artifacts;
    const segments = artifact.url.split("/");
    const last = segments
      .pop()!
      .replace(".css", ".min.css")
      .replace(".js", ".min.js");
    segments.push(last);
    artifact.url = segments.join("/");
    return artifacts;
  }

  @JSONSerializable()
  override toJSON() {
    return {
      ...super.toJSON(),
      minify: this.shouldMinify,
    };
  }
}

export const JSDelivrDependencySchema = z.intersection(
  DependencySchema,
  z.object({
    minify: z.boolean().optional().default(false),
  }),
);

export type JSDelivrDependencySchema = z.infer<typeof JSDelivrDependencySchema>;
