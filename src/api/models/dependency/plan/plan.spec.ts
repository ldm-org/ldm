import { MockInstance } from "vitest";
import { DownloadedArtifact, Plan } from "./plan";

describe(Plan.name, () => {
  it("should be defined", () => {
    const plan = new Plan([]);
    expect(plan).toBeDefined();
  });
});

describe(DownloadedArtifact.name, () => {
  let artifact: DownloadedArtifact;
  let extract: MockInstance<DownloadedArtifact["extract"]>;
  it("should be defined", () => {
    artifact = new DownloadedArtifact("path", "content");
    expect(artifact).toBeDefined();

    extract = vi.spyOn(artifact, "extract").mockImplementation(async () => {});
  });

  describe("extract", () => {
    it("should extract the artifact", async () => {
      await artifact.extract("destination");
      expect(extract).toHaveBeenCalledWith("destination");
    });
  });
});
