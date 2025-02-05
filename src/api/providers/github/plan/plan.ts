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
