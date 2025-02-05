import { P } from "ts-pattern";
import { RequestError } from "octokit";
import { Catch, PrintableError } from "@/api/error";
import {
  ArtifactDownloader,
  DownloadedArtifact,
} from "@/api/models/dependency/plan";
import { GithubSource } from "../source";

export class GithubArtifactDownloader extends ArtifactDownloader {
  public readonly ref: string;
  protected readonly source: GithubSource;

  constructor({
    path,
    ref,
    source,
  }: {
    path: string;
    ref: string;
    source: GithubSource;
  }) {
    super(path);
    this.ref = ref;
    this.source = source;
  }

  @Catch([
    [
      { error: P.instanceOf(RequestError), status: 401 },
      (self: GithubArtifactDownloader) =>
        new PrintableError(
          `Invalid GitHub token provided for source ${self.source.uri}`,
        ),
    ],
    [
      { error: P.instanceOf(RequestError), status: 404 },
      (self: GithubArtifactDownloader) =>
        new PrintableError(
          `Repository ${self.source.uri} not found or is private. ` +
            `Please check the repository URL and make sure the personal access token has access to the repository.`,
        ),
    ],
  ])
  async download(): Promise<DownloadedArtifact> {
    const client = this.source.getClient();
    const { owner, repo } = this.source;

    const { data: blob } = await client.rest.git.getBlob({
      owner,
      repo,
      file_sha: this.ref,
    });

    return new DownloadedArtifact(
      this.path,
      Buffer.from(blob.content, "base64"),
    );
  }
}
