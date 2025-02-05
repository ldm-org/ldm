import { Version } from "@/api/models/version";
import { PackageVersionMetadataTreeFiles } from "../../jsdelivr/api/client";
import {
  createDummyDirectoryMetadata,
  createDummyFileMetadata,
} from "../../jsdelivr/tree/package-version-metadata-tree.spec";
import { JSDelivrGithubSource } from "../source";
import { createDummyJSDelivrGithubSource } from "../source/source.spec";
import { JSDelivrGithubDependency } from "./dependency";

describe(JSDelivrGithubDependency.name, () => {
  const client = createDummyClient();
  let source: JSDelivrGithubSource;
  let dependency: JSDelivrGithubDependency;

  it("should be defined", () => {
    source = createDummyJSDelivrGithubSource({
      client: client as any,
    });
    dependency = new JSDelivrGithubDependency(
      {
        id: "test",
        uri: `${source.id}:///some/path`,
        version: "latest",
        destinations: ["some-destination"],
        minify: false,
      },
      source,
    );
    expect(dependency).toBeDefined();
  });

  describe("getLatestVersion", () => {
    it("should get the latest version", async () => {
      const version = await dependency.getLatestVersion();
      expect(client.getResolvedRepoVersion).toHaveBeenCalledWith({
        path: {
          user: dependency.specifier.source.owner,
          repo: dependency.specifier.source.repo,
        },
        query: {
          specifier: dependency.specifier.toString(),
        },
      });
      expect(version).instanceOf(Version);
      expect(version.toString()).toEqual("1.0.0");
    });
  });

  describe("plan", () => {
    it("should create a plan", async () => {
      const version = await dependency.getLatestVersion();
      const plan = await dependency.plan({ version });
      expect(plan).toBeDefined();
      expect(plan.artifacts).toHaveLength(3);
      for (const artifact of plan.artifacts) {
        expect(artifact.path).not.toEqual(".");
        expect(artifact.path.length).toBeGreaterThan(1);
      }
    });
  });
});

function createDummyClient() {
  return {
    getResolvedRepoVersion: vi.fn().mockResolvedValue({
      status: 200,
      data: {
        version: "1.0.0",
      },
    }),
    getRepoVersionMetadata: vi.fn().mockResolvedValue({
      status: 200,
      data: {
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
