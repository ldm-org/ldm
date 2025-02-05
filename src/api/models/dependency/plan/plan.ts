import { dirname, join } from "path";
import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";

export class Plan {
  constructor(public readonly artifacts: ArtifactDownloader[]) {}

  toMap(): Map<string, ArtifactDownloader> {
    return new Map(this.artifacts.map(artifact => [artifact.path, artifact]));
  }

  execute(): Promise<DownloadedArtifact[]> {
    return Promise.all(this.artifacts.map(artifact => artifact.download()));
  }
}

export abstract class ArtifactDownloader {
  constructor(public readonly path: string) {}

  abstract download(): Promise<DownloadedArtifact>;
}

export class DownloadedArtifact {
  public readonly path: string;
  public readonly content: string | Buffer;

  constructor(path: string, content: string | Buffer) {
    this.path = path;
    this.content = content;
  }

  async extract(destination: string) {
    const filePath = join(destination, this.path);
    if (!existsSync(dirname(filePath))) {
      mkdirSync(dirname(filePath), { recursive: true });
    }
    await writeFile(filePath, this.content);
  }
}
