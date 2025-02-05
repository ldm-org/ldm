import { PrintableError } from "@/api/error";
import { Version } from "@/api/models/version";
import { Plan } from "@/api/models/dependency/plan";
import { Dependency } from "@/api/models/dependency/dependency";
import { JSDelivrNPMSource } from "../source";
import { HTTPArtifactDownloader } from "../../http/plan";
import { JSDelivrNPMVersionSpecifier } from "../version";
import { PackageVersionMetadataTreeFiles } from "../../jsdelivr/api/client";
import { JSDelivrDependency } from "../../jsdelivr/dependency";
import { PackageVersionMetadataTree } from "../../jsdelivr/tree";
import { JSDelivrAPIClient } from "../../jsdelivr/api";

export class JSDelivrNPMDependency extends JSDelivrDependency {
  declare public readonly source: JSDelivrNPMSource;

  get path(): string {
    const path = super.path;
    if (path.startsWith("/")) {
      return path.slice(1);
    }
    if (path !== "default") {
      throw new PrintableError(
        `path must be either "default" or a path starts with a "/"`,
      );
    }
    return path;
  }

  get pathIsDefault() {
    return this.path === "default";
  }

  get specifier() {
    return new JSDelivrNPMVersionSpecifier({
      specifier: this.version,
      source: this.source,
    });
  }

  async getLatestVersion(
    specifier?: JSDelivrNPMVersionSpecifier | string,
  ): Promise<Version> {
    if (typeof specifier === "string") {
      specifier = new JSDelivrNPMVersionSpecifier({
        specifier,
        source: this.source,
      });
    } else if (!specifier) {
      specifier = this.specifier;
    } else {
      // Use specifier as given
    }

    const client = this.source.getClient();

    let response:
      | Awaited<ReturnType<JSDelivrAPIClient["getResolvedPackageVersion"]>>
      | Awaited<
          ReturnType<JSDelivrAPIClient["getResolvedScopedPackageVersion"]>
        >;
    if (this.source.isScoped) {
      response = await client.getResolvedScopedPackageVersion({
        path: {
          scope: this.source.package.scope!,
          package: this.source.package.name,
        },
        query: {
          specifier: specifier.toString(),
        },
      });
    } else {
      response = await client.getResolvedPackageVersion({
        path: {
          package: this.source.package.name,
        },
        query: {
          specifier: specifier.toString(),
        },
      });
    }

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
    const fullPackageName = `${this.source.uri}@${version.toString()}`;

    if (this.pathIsDefault) {
      return new Plan([
        new HTTPArtifactDownloader({
          url: `https://cdn.jsdelivr.net/npm/${fullPackageName}`,
        }),
      ]);
    }

    let response:
      | Awaited<ReturnType<typeof client.getPackageVersionMetadata>>
      | Awaited<ReturnType<typeof client.getScopedPackageVersionMetadata>>;
    if (this.source.isScoped) {
      response = await client.getScopedPackageVersionMetadata({
        path: {
          scope: this.source.package.scope!,
          package: this.source.package.name,
          version: version.toString(),
        },
      });
    } else {
      response = await client.getPackageVersionMetadata({
        path: {
          package: this.source.package.name,
          version: version.toString(),
        },
      });
    }

    if (response.status === 200) {
      const tree = new PackageVersionMetadataTree(
        response.data!.files as PackageVersionMetadataTreeFiles,
      );
      const files = tree.nagivate(this.path).flatten();
      const artifacts = files.map(
        file =>
          new HTTPArtifactDownloader({
            path: file.name,
            url: `https://cdn.jsdelivr.net/npm/${fullPackageName}/${file.path}`,
          }),
      );
      if (this.shouldMinify) {
        this.minify(artifacts);
      }
      return new Plan(artifacts);
    } else if (response.status === 404) {
      throw new PrintableError(`Package not found: ${fullPackageName}`);
    } else {
      throw new PrintableError(
        `Failed to get package metadata ${fullPackageName}: ${(response as any).error?.message ?? "Unexpected error"}`,
      );
    }
  }
}
