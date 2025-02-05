import crypto from "crypto";
import { faker } from "@faker-js/faker";
import { PackageVersionMetadataTreeFiles } from "../api/client";
import {
  PackageVersionMetadataTree,
  PackageVersionMetadataTreeFile,
} from "./package-version-metadata-tree";

describe(PackageVersionMetadataTree.name, () => {
  let tree: PackageVersionMetadataTree;
  it("should be defined", () => {
    tree = new PackageVersionMetadataTree(files);
  });

  describe("nagivate", () => {
    it("should return a new tree", () => {
      const navigated = tree.nagivate(
        "some/path",
      ) as PackageVersionMetadataTree;
      expect(navigated).toBeDefined();
      expect(navigated).toBeInstanceOf(PackageVersionMetadataTree);
      expect(navigated.files.length).toEqual(3);
    });

    it("should return a new file", () => {
      const navigated = tree.nagivate("some/index.js");
      expect(navigated).toBeDefined();
      expect(navigated).toBeInstanceOf(PackageVersionMetadataTreeFile);
    });
  });

  describe("flatten", () => {
    it("should return a flat array", () => {
      const flat = tree.flatten();
      expect(flat).toBeDefined();
      expect(flat.length).toEqual(8);
    });
  });
});

export function createDummyFileMetadata(opts?: {
  name?: string;
}): PackageVersionMetadataTreeFiles[number] {
  const { name = faker.system.fileName() } = opts ?? {};
  const hash = crypto.randomBytes(16).toString("hex");
  return {
    type: "file",
    name,
    hash,
    size: faker.number.int(),
  };
}

export function createDummyDirectoryMetadata(opts: {
  name?: string;
  dirents: PackageVersionMetadataTreeFiles;
}): PackageVersionMetadataTreeFiles[number] {
  const { name = faker.system.fileName(), dirents } = opts;
  return {
    name,
    type: "directory",
    files: dirents,
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
