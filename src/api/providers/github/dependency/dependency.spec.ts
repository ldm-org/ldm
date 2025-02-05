import { range } from "fp-ts/lib/NonEmptyArray";
import { GithubSource } from "../source";
import { createDummyGithubSource } from "../source/source.spec";
import { GithubDependency } from "./dependency";
import { GithubTree } from "./types";
import { createDummyGithubTree, createDummyGithubTreeNode } from "./types.spec";
import { GithubVersion } from "../version";

describe(GithubDependency.name, () => {
  let source: GithubSource;
  let dependency: GithubDependency;

  it("should be defined", () => {
    source = createDummyGithubSource();
    dependency = new GithubDependency(
      {
        id: "test",
        uri: `${source.id}:///some/path`,
        version: "latest",
        destinations: ["some-destination"],
      },
      source,
    );
  });

  describe("path", () => {
    it("should return the path", () => {
      expect(dependency.path).toEqual("some/path");
    });
  });

  describe("specifier", () => {
    it("should return the version specifier", () => {
      expect(dependency.specifier.toString()).toEqual("latest");
    });
  });

  describe("plan", () => {
    it("should return a plan if it is folder", async () => {
      const { root, trees } = createDummyTree(source);
      const getTree = vi
        .fn()
        .mockImplementation(({ tree_sha }) =>
          Promise.resolve({ data: trees.get(tree_sha) }),
        );
      vi.spyOn(source, "getClient").mockReturnValue({
        rest: {
          git: {
            getTree,
          },
        },
      } as any);

      const plan = await dependency.plan({
        version: new GithubVersion(root.sha),
      });

      expect(getTree).toHaveBeenCalledTimes(6);

      expect(plan.artifacts).toHaveLength(
        3 * 4, // 3 nodes per tree
      );
      for (const artifact of plan.artifacts) {
        expect(artifact.path).not.toEqual(".");
        expect(artifact.path.length).toBeGreaterThan(1);
      }

      /**
       * @description
       * Create a dummy tree with a random sha.
       *
       * Tree Structure:
       *
       * - trees[0]
       *   - trees[1]: some
       *     - trees[2]
       *     - trees[3]: path
       *       - trees[4]
       *       - trees[5]
       *         - trees[6]
       *
       * Each tree has 3 nodes of type "blob".
       */
      function createDummyTree(source: GithubSource) {
        const trees = range(1, 7).map(() =>
          createDummyGithubTree({
            source,
            nodes: range(1, 3).map(() =>
              createDummyGithubTreeNode({ type: "blob", source }),
            ),
          }),
        );

        const treeNodes = trees.map(({ sha }) =>
          createDummyGithubTreeNode({ type: "tree", sha, source }),
        );

        trees[0].tree.push(treeNodes[1]);
        trees[1].tree.push(treeNodes[2], treeNodes[3]);
        trees[3].tree.push(treeNodes[4], treeNodes[5]);
        trees[5].tree.push(treeNodes[6]);

        treeNodes[1].path = "some";
        treeNodes[3].path = "path";

        return {
          root: trees[0],
          trees: new Map<string, GithubTree>(
            trees.map(tree => [tree.sha, tree]),
          ),
        };
      }
    });
  });

  it("shold return a plan if it is a file", async () => {
    const { root, trees } = createDummyTree(source);
    const getTree = vi
      .fn()
      .mockImplementation(({ tree_sha }) =>
        Promise.resolve({ data: trees.get(tree_sha) }),
      );
    vi.spyOn(source, "getClient").mockReturnValue({
      rest: {
        git: {
          getTree,
        },
      },
    } as any);

    const plan = await dependency.plan({
      version: new GithubVersion(root.sha),
    });

    // It will not search for `trees[2]` because
    // navigation already found the file.
    expect(getTree).toHaveBeenCalledTimes(2);

    expect(plan.artifacts).toHaveLength(1);
    const [artifact] = plan.artifacts;
    expect(artifact.path).equal(".");

    /**
     * @description
     * Create a dummy tree with a random sha.
     *
     * Tree Structure:
     *
     * - trees[0]
     *   - trees[1]: some
     *     - trees[2]
     *     - blobs[0]: path
     *     - ...blobs
     *
     * Each tree has 3 nodes of type "blob".
     */
    function createDummyTree(source: GithubSource) {
      const trees = range(1, 3).map(() =>
        createDummyGithubTree({
          source,
          nodes: range(1, 3).map(() =>
            createDummyGithubTreeNode({ type: "blob", source }),
          ),
        }),
      );

      const treeNodes = trees.map(({ sha }) =>
        createDummyGithubTreeNode({ type: "tree", sha, source }),
      );

      trees[0].tree.push(treeNodes[1]);
      trees[1].tree.push(treeNodes[2]);

      treeNodes[1].path = "some";
      trees[1].tree[0].path = "path";

      return {
        root: trees[0],
        trees: new Map<string, GithubTree>(trees.map(tree => [tree.sha, tree])),
      };
    }
  });
});
