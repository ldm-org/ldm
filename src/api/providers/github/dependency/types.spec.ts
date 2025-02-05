import { faker } from "@faker-js/faker";
import { GithubSource } from "../source";
import { CommitSha } from "../version";
import {
  GithubTree,
  GithubTreeNode,
  isGithubTree,
  isGithubTreeNode,
} from "./types";
import { createDummyGithubSource } from "../source/source.spec";

describe(isGithubTree.name, () => {
  const source = createDummyGithubSource();

  it("should return true if the object is a GithubTree", () => {
    expect(
      isGithubTree(
        createDummyGithubTree({
          source,
          nodes: [],
        }),
      ),
    ).toEqual(true);
  });

  it("should return false if the object is not a GithubTree", () => {
    expect(
      isGithubTree(
        createDummyGithubTreeNode({
          source,
          type: "blob",
        }),
      ),
    ).toEqual(false);
  });
});

describe(isGithubTreeNode.name, () => {
  const source = createDummyGithubSource();

  it("should return true if the object is a GithubTreeNode", () => {
    expect(
      isGithubTreeNode(
        createDummyGithubTreeNode({
          source,
          type: "blob",
        }),
      ),
    ).toEqual(true);
    expect(
      isGithubTreeNode(
        createDummyGithubTreeNode({
          source,
          type: "tree",
          sha: CommitSha.random(),
        }),
      ),
    );
  });
});

export function createDummyGithubTree(options: {
  nodes: GithubTreeNode[];
  source: GithubSource;
}): GithubTree {
  const { nodes, source } = options;
  const sha = CommitSha.random();
  return {
    sha,
    url: `https://api.github.com/repos/${source.owner}/${source.repo}/git/trees/${sha}`,
    tree: nodes,
    truncated: false,
  };
}

export function createDummyGithubTreeNode(
  options: CreateDummyGithubTreeNodeOptions,
): GithubTreeNode {
  const path = options.path ?? faker.system.fileName();
  if (options.type === "tree") {
    const sha = options.sha;
    return {
      path,
      mode: "040000",
      type: "tree",
      sha,
      url: `https://api.github.com/repos/${options.source.owner}/${options.source.repo}/git/trees/${sha}`,
    };
  } else {
    const sha = CommitSha.random();
    return {
      path,
      mode: "100644",
      type: "blob",
      sha: CommitSha.random(),
      size: faker.number.int(1000),
      url: `https://api.github.com/repos/${options.source.owner}/${options.source.repo}/git/blobs/${sha}`,
    };
  }
}

type CreateDummyGithubTreeNodeOptions = (
  | CreateDummyGithubTreeTreeNodeOptions
  | CreateDummyGithubBlobTreeNodeOptions
) & {
  source: GithubSource;
  path?: string;
};

interface CreateDummyGithubTreeTreeNodeOptions {
  type: "tree";
  sha: string;
}

interface CreateDummyGithubBlobTreeNodeOptions {
  type: "blob";
}
