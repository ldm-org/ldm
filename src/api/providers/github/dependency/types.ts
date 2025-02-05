import { Octokit } from "octokit";

export type GithubTree = Awaited<
  ReturnType<Octokit["rest"]["git"]["getTree"]>
>["data"];

export type GithubTreeNode = GithubTree["tree"][number];

export function isGithubTree(
  tree: GithubTreeNode | GithubTree,
): tree is GithubTree {
  return "tree" in tree;
}

export function isGithubTreeNode(
  tree: GithubTreeNode | GithubTree,
): tree is GithubTreeNode {
  return !isGithubTree(tree);
}
