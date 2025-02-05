import { Version } from "@/api/models/version";
import { ArtifactDownloader } from "@/api/models/dependency/plan";
import { JSDelivrNPMSource } from "../source";
import { createDummyJSDelivrNPMSource } from "../source/source.spec";
import { JSDelivrNPMDependency } from "./dependency";
import { PackageVersionMetadataTreeFiles } from "../../jsdelivr/api/client";
import {
  createDummyDirectoryMetadata,
  createDummyFileMetadata,
} from "../../jsdelivr/tree/package-version-metadata-tree.spec";

const cases = [
  {
    name: "default",
    inputs: {
      scoped: false,
      path: "default",
    },
    expected: {
      clientCalls: "getResolvedPackageVersion",
      version: "1.0.0",
      pathIsDefault: true,
      artifacts: {
        length: 1,
        each: (artifact: ArtifactDownloader) => {
          expect(artifact.path).toEqual(".");
        },
      },
    },
  },
  {
    name: "path & plain",
    inputs: {
      scoped: false,
      path: "/some/path",
    },
    expected: {
      clientCalls: "getResolvedPackageVersion",
      version: "1.0.0",
      pathIsDefault: false,
      artifacts: {
        length: 3,
        each: (artifact: ArtifactDownloader) => {
          expect(artifact.path).not.toEqual(".");
          expect(artifact.path.length).toBeGreaterThan(1);
        },
      },
    },
  },
  {
    name: "path & scoped",
    inputs: {
      scoped: true,
      path: "/some/path",
    },
    expected: {
      clientCalls: "getResolvedScopedPackageVersion",
      version: "1.0.0",
      pathIsDefault: false,
      artifacts: {
        length: 3,
        each: (artifact: ArtifactDownloader) => {
          expect(artifact.path).not.toEqual(".");
          expect(artifact.path.length).toBeGreaterThan(1);
        },
      },
    },
  },
];

describe(JSDelivrNPMDependency.name, () => {
  cases.forEach(({ name, inputs, expected }) => {
    describe(name, () => {
      const client = createDummyClient();
      let source: JSDelivrNPMSource;
      let dependency: JSDelivrNPMDependency;

      it("should be defined", () => {
        source = createDummyJSDelivrNPMSource({
          scoped: inputs.scoped,
          client: client as any,
        });
        dependency = new JSDelivrNPMDependency(
          {
            id: "test",
            uri: `${source.id}://${inputs.path}`,
            version: "latest",
            destinations: ["some-destination"],
            minify: false,
          },
          source,
        );
        expect(source.isScoped).toBe(inputs.scoped);
        expect(dependency).toBeDefined();
        expect(dependency.pathIsDefault).toBe(expected.pathIsDefault);
      });

      describe("getLatestVersion", () => {
        it("should get the latest version", async () => {
          const specifier = dependency.specifier;
          const version = await dependency.getLatestVersion();
          expect(
            client[expected.clientCalls as keyof typeof client],
          ).toHaveBeenCalledWith({
            path: {
              scope: specifier.source.package.scope,
              package: specifier.source.package.name,
            },
            query: {
              specifier: specifier.toString(),
            },
          });
          expect(version).instanceOf(Version);
          expect(version.toString()).toEqual(expected.version);
        });
      });

      describe("plan", () => {
        it("should create a plan", async () => {
          const version = await dependency.getLatestVersion();
          const plan = await dependency.plan({ version });
          expect(plan).toBeDefined();
          expect(plan.artifacts).toHaveLength(expected.artifacts.length);
          for (const artifact of plan.artifacts) {
            expected.artifacts.each(artifact);
          }
        });
      });
    });
  });
});

const version = "1.0.0";
function createDummyClient() {
  return {
    getResolvedScopedPackageVersion: vi.fn().mockResolvedValue({
      status: 200,
      data: {
        version,
      },
    }),
    getResolvedPackageVersion: vi.fn().mockResolvedValue({
      status: 200,
      data: {
        version,
      },
    }),
    getScopedPackageVersionMetadata: vi.fn().mockResolvedValue({
      status: 200,
      data: {
        default: "/default.js",
        files,
      },
    }),
    getPackageVersionMetadata: vi.fn().mockResolvedValue({
      status: 200,
      data: {
        default: "/default.js",
        files,
      },
    }),
  };
}

const files: PackageVersionMetadataTreeFiles = [
  createDummyFileMetadata({ name: "default.js" }),
  createDummyFileMetadata({ name: "another.js" }),
  createDummyFileMetadata({ name: "some" }),
  createDummyDirectoryMetadata({
    name: "some",
    dirents: [
      createDummyFileMetadata({ name: "index.js" }),
      createDummyFileMetadata({ name: "file.js" }),
      createDummyDirectoryMetadata({
        name: "path",
        dirents: [
          createDummyFileMetadata({ name: "index.js" }),
          createDummyFileMetadata({ name: "file.js" }),
          createDummyDirectoryMetadata({
            name: "folder",
            dirents: [createDummyFileMetadata({ name: "file.js" })],
          }),
        ],
      }),
    ],
  }),
];
