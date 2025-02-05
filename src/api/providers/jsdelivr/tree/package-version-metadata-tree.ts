import { join } from "path";
import { PrintableError } from "@/api/error";
import {
  PackageVersionMetadataFlatFiles,
  PackageVersionMetadataTreeFiles,
} from "../api/client";

export class PackageVersionMetadataTree {
  constructor(public readonly files: PackageVersionMetadataTreeFiles) {}

  nagivate(path: string) {
    const navigated = navigate(this.files, path);
    if (Array.isArray(navigated)) {
      return new PackageVersionMetadataTree(navigated);
    } else {
      return new PackageVersionMetadataTreeFile(navigated);
    }
  }

  flatten() {
    return Array.from(flatten(this.files));
  }
}

export class PackageVersionMetadataTreeFile {
  constructor(public readonly file: PackageVersionMetadataFlatFile) {}

  flatten() {
    return Array.from(flatten(this.file));
  }
}

function navigate(
  files: PackageVersionMetadataTreeFiles,
  current?: string,
  parent?: string,
): PackageVersionMetadataTreeFiles | PackageVersionMetadataFlatFile {
  const [subpath, ...rest] = current?.split("/") || [];
  if (!subpath) {
    return files.map(file => ({
      ...file,
      path: join(parent ?? "", file.name),
    }));
  }
  const nodes = files.filter(file => file.name === subpath);
  if (nodes.length === 0) {
    throw new PrintableError(`File/Folder not found: ${subpath}`);
  }
  let node: PackageVersionMetadataTreeFiles[number];
  if (nodes.length > 1) {
    if (rest.length === 0) {
      node = nodes.find(file => file.type === "file")!;
    } else {
      node = nodes.find(file => file.type === "directory")!;
    }
  } else {
    node = nodes.at(0)!;
  }
  switch (node.type) {
    case "directory":
      return navigate(node.files, rest.join("/"), join(parent ?? "", subpath));
    case "file":
      return { ...node, path: join(parent ?? "", node.name) };
    default:
      throw new PrintableError(`Unexpected file type: ${(node as any).type}`);
  }
}

function* flatten(
  files: PackageVersionMetadataTreeFiles | PackageVersionMetadataFlatFile,
  dir: string = "",
): Generator<PackageVersionMetadataFlatFile> {
  if (!Array.isArray(files)) {
    yield { ...files, name: dir || "." };
  } else {
    for (const file of files) {
      const nextPath = join(dir, file.name);
      if (file.type === "directory") {
        yield* flatten(file.files, nextPath);
      } else {
        yield* flatten(file as PackageVersionMetadataFlatFile, nextPath);
      }
    }
  }
}

type PackageVersionMetadataFlatFile =
  PackageVersionMetadataFlatFiles[number] & { type: "file" } & {
    path: string;
  };
