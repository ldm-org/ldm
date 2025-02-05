import { PrintableError } from "@/api/error";
import { Dependency } from "@/api/models/dependency/dependency";
import { Plan } from "@/api/models/dependency/plan";
import { Version } from "@/api/models/version";
import { JSDelivrDependency } from "../../jsdelivr/dependency";
import { JSDelivrGithubVersionSpecifier } from "../version";
import { JSDelivrGithubSource } from "../source";
import { PackageVersionMetadataTree } from "../../jsdelivr/tree";
import { PackageVersionMetadataTreeFiles } from "../../jsdelivr/api/client";
import { HTTPArtifactDownloader } from "../../http/plan";

export class JSDelivrGithubDependency extends JSDelivrDependency {
  declare public readonly source: JSDelivrGithubSource;

  get path(): string {
    const path = super.path;
    if (!path.startsWith("/")) {
      throw new PrintableError(`path must start with a "/"`);
    }
    return path.slice(1);
  }

  get specifier() {
    return new JSDelivrGithubVersionSpecifier({
      specifier: this.version,
      source: this.source,
    });
  }

  async getLatestVersion(
    specifier?: JSDelivrGithubVersionSpecifier | string,
  ): Promise<Version> {
    if (typeof specifier === "string") {
      specifier = new JSDelivrGithubVersionSpecifier({
        specifier,
        source: this.source,
      });
    } else if (!specifier) {
      specifier = this.specifier;
    } else {
      // Use specifier as given
    }

    const client = this.source.getClient();

    const response = await client.getResolvedRepoVersion({
      path: {
        user: this.source.owner,
        repo: this.source.repo,
      },
      query: {
        specifier: specifier.toString(),
      },
    });

    if (response.status === 200) {
      const version = response.data!.version;
      if (!version) {
        throw new PrintableError(
          `Failed to get latest version for ${this.source.uri}`,
        );
      }
      return new Version(version);
    } else if (response.status === 404) {
      throw new PrintableError(
        `No matching version found for ${this.source.uri}@${specifier.toString()}`,
      );
    } else {
      throw new PrintableError(
        `Failed to get latest version for ${this.source.uri}: ${(response as any).error?.message ?? "Unexpected error"}`,
      );
    }
  }

  async plan(options: Dependency.PlanOptions) {
    const { version } = options;
    const client = this.source.getClient();
    const fullRepoName = `${this.source.uri}@${version.toString()}`;

    const response = await client.getRepoVersionMetadata({
      path: {
        user: this.source.owner,
        repo: this.source.repo,
        version: version.toString(),
      },
    });

    if (response.status === 200) {
      const tree = new PackageVersionMetadataTree(
        response.data!.files as PackageVersionMetadataTreeFiles,
      );
      const files = tree.nagivate(this.path).flatten();
      const artifacts = files.map(
        file =>
          new HTTPArtifactDownloader({
            path: file.name,
            url: `https://cdn.jsdelivr.net/gh/${fullRepoName}/${file.path}`,
          }),
      );
      if (this.shouldMinify) {
        this.minify(artifacts);
      }
      return new Plan(artifacts);
    } else if (response.status === 404) {
      throw new PrintableError(`Repository not found: ${fullRepoName}`);
    } else {
      throw new PrintableError(
        `Failed to get repository metadata ${fullRepoName}: ${(response as any).error?.message ?? "Unexpected error"}`,
      );
    }
  }
}
