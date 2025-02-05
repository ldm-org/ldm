import "core-js/actual/array/from-async";
import semver from "semver";
import { join } from "path";
import { PrintableError } from "@/api/error";
import { Dependency } from "@/api/models/dependency/dependency";
import { Plan } from "@/api/models/dependency/plan";
import { GithubSource } from "../source";
import { GithubArtifactDownloader } from "../plan";
import { GithubVersionSpecifier, GithubVersion } from "../version";
import { GithubTree, GithubTreeNode, isGithubTreeNode } from "./types";
import { match, P } from "ts-pattern";
import { RequestError } from "octokit";
import { raise } from "@/utils";

export class GithubDependency extends Dependency {
  declare public readonly source: GithubSource;

  get path() {
    const path = super.path;
    if (!path.startsWith("/")) {
      throw new PrintableError(
        `Invalid path: ${path}. Path must start with '/' for Github dependencies`,
      );
    }
    return path.slice(1);
  }

  get specifier() {
    return new GithubVersionSpecifier({
      specifier: this.version,
      source: this.source,
      path: this.path,
    });
  }

  async getLatestVersion(specifier?: GithubVersionSpecifier | string) {
    if (typeof specifier === "string") {
      specifier = new GithubVersionSpecifier({
        specifier,
        source: this.source,
        path: this.path,
      });
    } else if (!specifier) {
      specifier = this.specifier;
    } else {
      // Use specifier as given
    }

    const client = this.source.getClient();

    if (specifier.isCommitHash) {
      const response = await client.rest.repos
        .getCommit({
          owner: this.source.owner,
          repo: this.source.repo,
          ref: specifier.toString(),
        })
        .catch((error: any) =>
          match({ error, status: error.status })
            .with({ error: P.instanceOf(RequestError), status: 404 }, () =>
              raise(
                new PrintableError(`Commit ${specifier.toString()} not found`),
              ),
            )
            .otherwise(() => raise(error)),
        );
      return new GithubVersion(response.data.sha);
    }

    const response = await client.rest.git.listMatchingRefs({
      ref: "tags",
      owner: this.source.owner,
      repo: this.source.repo,
    });
    const tags = Array.from(
      new Set(response.data.map(tag => tag.ref.replace("refs/tags/", ""))),
    ).sort(semver.compare);
    if (specifier.isSemver) {
      const version = semver.maxSatisfying(tags, specifier.toString());
      if (!version) {
        throw new PrintableError(
          `No matching version found for ${this.source.uri}@${specifier.toString()}`,
        );
      }
      return new GithubVersion(version);
    }

    if (tags.length !== 0) {
      return new GithubVersion(tags.at(-1)!);
    }

    const latestCommit = await client.rest.repos.listCommits({
      owner: this.source.owner,
      repo: this.source.repo,
      per_page: 1,
      path: this.path,
    });
    if (latestCommit.data.length === 0) {
      throw new PrintableError(`No commits found for ${this.path}`);
    }
    return new GithubVersion(latestCommit.data.at(0)!.sha);
  }

  async plan(options: GithubDependency.PlanOptions) {
    const { version } = options;
    const client = this.source.getClient();
    const { owner, repo } = this.source;

    const tree = await navigate(await getTree(version.toString()), this.path);
    const nodes = await Array.fromAsync(flatten(tree));
    const artifacts = nodes.map(
      node =>
        new GithubArtifactDownloader({
          path: node.path!,
          ref: node.sha!,
          source: this.source,
        }),
    );

    const plan = new Plan(artifacts);

    return plan;

    function getTree(sha: string): Promise<GithubTree> {
      return client.rest.git
        .getTree({
          owner,
          repo,
          tree_sha: sha,
        })
        .then(response => response.data);
    }

    async function navigate(
      tree: GithubTree,
      path?: string,
    ): Promise<GithubTree | GithubTreeNode> {
      const [subpath, ...rest] = path?.split("/") || [];
      if (!subpath) {
        return tree;
      }
      const nodes = tree.tree.filter(node => node.path === subpath);
      if (nodes.length === 0) {
        throw new PrintableError(`File/Folder not found: ${subpath}`);
      }
      let node: GithubTreeNode;
      if (nodes.length > 1) {
        if (rest.length === 0) {
          node = nodes.find(node => node.type === "blob")!;
        } else {
          node = nodes.find(node => node.type === "tree")!;
        }
      } else {
        node = nodes.at(0)!;
      }
      switch (node.type) {
        case "tree":
          return await navigate(await getTree(node.sha!), rest.join("/"));
        case "blob": {
          if (rest.length > 0) {
            throw new PrintableError(`File cannot have subpath: ${subpath}`);
          } else {
            return node;
          }
        }
        default:
          throw new PrintableError(`Unsupported node type: ${node.type}`);
      }
    }

    async function* flatten(
      tree: GithubTree | GithubTreeNode,
      dir: string = "",
    ): AsyncGenerator<GithubTreeNode> {
      if (isGithubTreeNode(tree)) {
        yield {
          ...tree,
          path: dir || ".",
        } satisfies GithubTreeNode;
        return;
      }

      for (const node of tree.tree) {
        const nextPath = join(dir, node.path ?? "");
        switch (node.type) {
          case "tree": {
            yield* await flatten(await getTree(node.sha!), nextPath);
            break;
          }
          case "blob":
            yield* await flatten(node, nextPath);
            break;
          default:
            throw new PrintableError(`Unsupported node type: ${node.type}`);
        }
      }
    }
  }
}

export namespace GithubDependency {
  export interface PlanOptions extends Dependency.PlanOptions {
    version: GithubVersion;
  }
}
