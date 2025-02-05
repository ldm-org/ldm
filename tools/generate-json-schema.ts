import { z } from "zod";
import { writeFileSync } from "fs";
import { pipe } from "fp-ts/lib/function";
import merge from "lodash/merge";
import { zodToJsonSchema } from "zod-to-json-schema";
import traverse from "traverse";
import { api } from "@";
import { map } from "fp-ts/lib/Array";

function main() {
  const GithubSourceSchema = api.providers.github.GithubSourceSchema;
  const JSDelivrNPMSourceSchema = api.model.SourceSchema.and(
    z.object({
      provider: z.literal("jsdelivr:npm"),
    }),
  );
  const JSDelivrGithubSourceSchema = api.model.SourceSchema.and(
    z.object({
      provider: z.literal("jsdelivr:github"),
    }),
  );

  const sources = generate(
    [
      {
        name: "GithubSourceSchema",
        schema: GithubSourceSchema,
      },
      {
        name: "JSDelivrNPMSourceSchema",
        schema: JSDelivrNPMSourceSchema,
      },
      {
        name: "JSDelivrGithubSourceSchema",
        schema: JSDelivrGithubSourceSchema,
      },
    ],
    removeProperty("id"),
  );

  const HTTPDependencySchema = api.model.DependencySchema;
  const GithubDependencySchema = api.model.DependencySchema;
  const JSDelivrNPMDependencySchema =
    api.providers.jsdelivr.JSDelivrDependencySchema;
  const JSDelivrGithubDependencySchema =
    api.providers.jsdelivr.JSDelivrDependencySchema;
  const dependencies = generate(
    [
      {
        name: "HTTPDependencySchema",
        schema: HTTPDependencySchema,
      },
      {
        name: "GithubDependencySchema",
        schema: GithubDependencySchema,
      },
      {
        name: "JSDelivrNPMDependencySchema",
        schema: JSDelivrNPMDependencySchema,
      },
      {
        name: "JSDelivrGithubDependencySchema",
        schema: JSDelivrGithubDependencySchema,
      },
    ],
    schema =>
      pipe(
        schema,
        removeProperty("id"),
        modify("additionalProperties", () => true),
      ),
  );

  const ProjectSpecificationSchema = api.model.ProjectSpecificationSchema;

  const schema = zodToJsonSchema(
    ProjectSpecificationSchema,
    "ProjectSpecificationSchema",
  );
  schema.definitions = merge({}, schema.definitions, sources, dependencies);
  const spec = schema.definitions.ProjectSpecificationSchema as any;
  spec.properties.dependencies = {
    type: "object",
    additionalProperties: {
      anyOf: pipe(
        Object.keys(dependencies),
        map(key => ({
          $ref: `#/definitions/${key}`,
        })),
      ),
    },
  };
  spec.properties.sources = {
    type: "object",
    additionalProperties: {
      oneOf: pipe(
        Object.keys(sources),
        map(key => ({
          $ref: `#/definitions/${key}`,
        })),
      ),
    },
  };

  writeFileSync(
    process.argv[2] ?? "schema.json",
    JSON.stringify(schema, null, 2),
  );

  function generate(
    generations: { name: string; schema: z.ZodType<any> }[],
    modifications?: (schema: Record<string, any>) => void,
  ) {
    const definitions: Record<string, any> = {};
    for (const generation of generations) {
      const source = zodToJsonSchema(generation.schema, generation.name)
        .definitions![generation.name];
      modifications?.(source);
      definitions[generation.name] = source;
    }
    return definitions;
  }

  function modify(key: string, modifier: (value: any) => any) {
    return (schema: Record<string, any>) => {
      traverse(schema).forEach(function (value) {
        if (typeof value === "object" && value !== null && key in value) {
          value[key] = modifier(value[key]);
        }
      });
      return schema;
    };
  }

  function removeProperty(key: string) {
    return (schema: Record<string, any>) => {
      traverse(schema).forEach(function (value) {
        if (
          typeof value === "object" &&
          value !== null &&
          "properties" in value &&
          key in value.properties
        ) {
          delete value.properties[key];
          if (Array.isArray(value.required) && value.required.includes(key)) {
            value.required.splice(value.required.indexOf(key), 1);
          }
        }
      });
      return schema;
    };
  }
}

main();
