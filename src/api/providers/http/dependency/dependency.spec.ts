import { HTTPDependency } from "./dependency";
import { HTTPArtifactDownloader } from "../plan";
import { httpsSource } from "../source";

describe(HTTPDependency.name, () => {
  let dependency: HTTPDependency;

  it("should be defined", () => {
    dependency = new HTTPDependency(
      {
        id: "test",
        uri: "https://example.com/style.css",
        version: "latest",
        destinations: ["some-destination"],
        method: "GET",
        headers: [
          {
            key: "Content-Type",
            value: "text/css",
          },
        ],
      },
      httpsSource,
    );
    expect(dependency).toBeDefined();
  });

  describe("getHeaders", () => {
    it("should return headers as object", () => {
      expect(dependency.getHeaders()).toEqual({
        "Content-Type": "text/css",
      });
    });
  });

  describe("getLatestVersion", () => {
    it("should return latest", () => {
      expect(dependency.getLatestVersion().toString()).toBe("latest");
    });
  });

  describe("plan", () => {
    it("should return a plan", () => {
      const plan = dependency.plan();

      expect(plan).toBeDefined();
      expect(plan.artifacts).toHaveLength(1);

      const downloader = plan.artifacts.at(0) as HTTPArtifactDownloader;
      expect(downloader.url).toEqual("https://example.com/style.css");
      expect(downloader.method).toEqual("GET");
      expect(downloader.headers).toEqual({
        "Content-Type": "text/css",
      });
      expect(downloader.params).toBeUndefined();
      expect(downloader.data).toBeUndefined();
    });
  });
});
