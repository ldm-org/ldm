import { z } from "zod";
import { writeFileSync } from "fs";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  ConfigSchema,
  SourceSchema,
  GithubSourceSchema,
  HTTPDependencySchema,
  JSDelivrDependencySchema,
  DependencySchema,
} from "@";

function main() {
  const ProjectSpecificationSchema = z.object({
    version: z.string().optional(),
    dependencies: z.record(
      z.union([
        DependencySchema,
        HTTPDependencySchema,
        JSDelivrDependencySchema,
      ]),
    ),
    sources: z
      .record(
        z.union([
          z.intersection(
            SourceSchema.omit({ provider: true }),
            z.object({
              provider: z.enum(["github", "jsdelivr:npm", "jsdelivr:github"]),
            }),
          ),
          GithubSourceSchema,
        ]),
      )
      .optional(),
    config: ConfigSchema.optional(),
  });

  const schema = zodToJsonSchema(
    ProjectSpecificationSchema,
    "ProjectSpecificationSchema",
  );

  writeFileSync("schema.json", JSON.stringify(schema, null, 2));
}

main();
