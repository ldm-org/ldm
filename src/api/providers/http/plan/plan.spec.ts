import { AxiosError, isAxiosError } from "axios";
import { HTTPArtifactDownloader } from "./plan";

describe(HTTPArtifactDownloader.name, () => {
  let downloader: HTTPArtifactDownloader;
  let axios: ReturnType<typeof createAxiosInstance>;

  it("should be defined", () => {
    axios = createAxiosInstance();
    downloader = new HTTPArtifactDownloader({
      url: "https://example.com/style.css",
      method: "GET",
      axios: axios as any,
    });
    expect(downloader).toBeDefined();
  });

  describe("download", () => {
    it("should download the artifact", async () => {
      const css = `
body {
  background-color: red;
}
`;
      axios.request.mockResolvedValueOnce({
        data: btoa(css),
      });
      const artifact = await downloader.download();
      expect(artifact.path).toEqual(".");
      expect(artifact.content.toString("utf-8")).toEqual(css);
    });

    it("should throw an error if the download fails", async () => {
      axios.request.mockImplementationOnce(() => {
        throw new AxiosError("Failed to download", "500");
      });
      await expect(() => downloader.download()).rejects.toThrow(
        new RegExp(
          "Failed to download artifact from https://example.com/style.css",
        ),
      );
    });
  });
});

function createAxiosInstance() {
  return {
    request: vi.fn(),
    isAxiosError: isAxiosError,
  };
}
