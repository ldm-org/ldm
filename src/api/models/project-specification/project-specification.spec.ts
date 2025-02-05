import yaml from "js-yaml";
import dotenv from "dotenv";
import merge from "lodash/merge";
import { dirname, join } from "path";
import { findUpSync } from "find-up";
import { readFileOrNullSync } from "@/utils";
import {
  ProjectSpecification,
  ProjectSpecificationSchema,
} from "./project-specification";

const WORKSPACE_ROOT = dirname(findUpSync("package.json", { cwd: __dirname })!);

const envFile = join(WORKSPACE_ROOT, ".env");
const env = merge(
  {},
  process.env,
  dotenv.parse(readFileOrNullSync(envFile, "utf-8") ?? ""),
);

describe(ProjectSpecification.name, () => {
  let subslate: typeof import("subslate").default;
  let spec: ProjectSpecification;

  beforeAll(async () => {
    subslate = (await import("subslate")).default;
  });

  it("should create an instance", async () => {
    const substituted = subslate(specification, env);
    spec = new ProjectSpecification(
      yaml.load(substituted) as ProjectSpecificationSchema,
    );
    await spec.prepare();
  });

  it("should not create instance if there's duplicate dependencies", () => {
    expect(
      () =>
        new ProjectSpecification(
          yaml.load(`
version: '1'

dependencies:
  - name: primitive
    uri: @ts-essentials/ts-essentials:///lib/primitive/index.ts
    version: latest
    destination: src/types/primitive.ts
  - name: primitive-duplicate
    uri: @ts-essentials/ts-essentials:///lib/primitive/index.ts
    version: latest
    destination: src/types/primitive.duplicate.ts

sources:
  - id: '@ts-essentials/ts-essentials'
    provider: github
    uri: ts-essentials/ts-essentials
`) as ProjectSpecificationSchema,
        ),
    ).toThrow();
  });

  it("should not create instance if there's duplicate names", () => {
    expect(
      () =>
        new ProjectSpecification(
          yaml.load(`
version: '1'

dependencies:
  - name: same-name
    uri: @ts-essentials/ts-essentials:///lib/primitive/index.ts
    version: latest
    destination: src/types/primitive.ts
  - name: same-name
    uri: jquery://default
    version: ^3.6.4
    destinations:
      - src/core.min.js
      - public/js/core.min.js

sources:
  - id: '@ts-essentials/ts-essentials'
    provider: github
    uri: ts-essentials/ts-essentials
  - id: jquery
    provider: jsdelivr:npm
    uri: jquery
`) as ProjectSpecificationSchema,
        ),
    ).toThrow();
  });

  it('should not create instance if destination ends with "/"', () => {
    expect(
      () =>
        new ProjectSpecification(
          yaml.load(`
version: '1'

dependencies:
  - name: same-name
    uri: @ts-essentials/ts-essentials:///lib/primitive/index.ts
    version: latest
    destination: src/types/

sources:
  - id: '@ts-essentials/ts-essentials'
    provider: github
    uri: ts-essentials/ts-essentials
`) as ProjectSpecificationSchema,
        ),
    ).toThrow();
  });

  describe("dependencies", () => {
    it("should return a map of dependencies", () => {
      const map = spec.dependencies;
      expect(map).instanceOf(Map);
      expect(map.size).toBe(3);
    });
  });

  describe("sources", () => {
    it("should return a map of sources", () => {
      const map = spec.sources;
      expect(map).instanceOf(Map);
      expect(map.size).toBe(4);
    });
  });

  describe("toJSON", () => {
    it("should return JSON object", () => {
      const substituted = subslate(expected, env);
      expect(spec.toJSON()).toEqual(yaml.load(substituted));
    });
  });
});

const specification = `
version: '1'

dependencies:
  primitive.ts:
    uri: '@ts-essentials/ts-essentials:///lib/primitive/index.ts'
    version: latest
    destination: src/types/primitive.ts
  jquery:
    uri: jquery://default # or something like jquery:///src/core.min.js
    version: ^3.6.4
    destinations:
      - src/core.min.js
      - public/js/core.min.js
  reset.css:
    uri: https://meyerweb.com/eric/tools/css/reset/reset200802.css
    destination: public/css/reset.css
    headers:
      - key: Content-Type
        value: text/css

sources:
  '@ts-essentials/ts-essentials':
    provider: github
    uri: ts-essentials/ts-essentials
    auth:
      token: \${GITHUB_TOKEN}
  jquery:
    provider: jsdelivr:npm
    uri: jquery

config:
  envFile: .env.local
  deleteFilesOnRemove: false

`;

const expected = `
version: '1'

dependencies:
  primitive.ts:
    uri: '@ts-essentials/ts-essentials:///lib/primitive/index.ts'
    version: latest
    destinations:
      - src/types/primitive.ts
  jquery:
    uri: jquery://default # or something like jquery:///src/core.min.js
    version: ^3.6.4
    minify: false
    destinations:
      - src/core.min.js
      - public/js/core.min.js
  reset.css:
    uri: https://meyerweb.com/eric/tools/css/reset/reset200802.css
    url: https://meyerweb.com/eric/tools/css/reset/reset200802.css
    version: latest
    method: GET
    destinations:
      - public/css/reset.css
    headers:
      - key: Content-Type
        value: text/css

sources:
  '@ts-essentials/ts-essentials':
    provider: github
    uri: ts-essentials/ts-essentials
    auth:
      token: \${GITHUB_TOKEN}
  jquery:
    provider: jsdelivr:npm
    uri: jquery

config:
  envFile: .env.local
  deleteFilesOnRemove: false

`;
