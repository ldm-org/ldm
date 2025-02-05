import { z } from "zod";
import { writeFileSync } from "fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  ConfigSchema,
  SourceSchema,
  GithubSourceSchema,
  HTTPDependencySchema,
  DependencySchema,
  JSDelivrDependencySchema,
} from "@";

const ProjectSpecificationSchema = z.object({
  version: z.string().optional(),
  dependencies: z.record(
    z.union([DependencySchema, HTTPDependencySchema, JSDelivrDependencySchema]),
  ),
  sources: z.record(z.union([SourceSchema, GithubSourceSchema])).optional(),
  config: ConfigSchema.optional(),
});

const schema = zodToJsonSchema(
  ProjectSpecificationSchema,
  "ProjectSpecificationSchema",
);

writeFileSync("schema.json", JSON.stringify(schema, null, 2));
