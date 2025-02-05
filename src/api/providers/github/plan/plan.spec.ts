import { GithubSource } from "../source";
import { createDummyGithubSource } from "../source/source.spec";
import { CommitSha } from "../version";
import { GithubArtifactDownloader } from "./plan";

describe(GithubArtifactDownloader.name, () => {
  let source: GithubSource;
  let downloader: GithubArtifactDownloader;

  it("should be defined", () => {
    source = createDummyGithubSource();
    downloader = new GithubArtifactDownloader({
      path: "some/path.txt",
      ref: CommitSha.random(),
      source,
    });
    expect(downloader).toBeDefined();
  });

  describe("download", () => {
    it("should download the artifact", async () => {
      const content = "some text";
      const getBlob = vi
        .fn()
        .mockResolvedValue({ data: { content: btoa(content) } } as any);
      vi.spyOn(source, "getClient").mockReturnValue({
        rest: {
          git: {
            getBlob,
          },
        },
      } as any);

      const artifact = await downloader.download();

      expect(getBlob).toHaveBeenCalledWith({
        owner: source.owner,
        repo: source.repo,
        file_sha: downloader.ref,
      });

      expect(artifact.path).toEqual("some/path.txt");
      expect(artifact.content.toString("utf-8")).toEqual(content);
    });
  });
});
