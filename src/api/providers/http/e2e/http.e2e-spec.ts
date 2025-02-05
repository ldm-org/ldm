import { dirname, join } from "path";
import { findUpSync } from "find-up";
import { existsSync, rmSync } from "fs";
import { HTTPDependency } from "../dependency";
import { httpsSource } from "../source";
import { compareSync } from "dir-compare";

const name = "HTTPDependency:E2E";

const root = join(
  dirname(findUpSync("package.json", { cwd: __dirname })!),
  "tmp",
  name,
);

const cases = [
  {
    name: "Retrieve Image",
    uri: "https://picsum.photos/200/300",
    destination: "image.jpg",
  },
  {
    name: "Retrieve JSON",
    uri: "https://jsonplaceholder.typicode.com/posts/1",
    destination: "post.json",
  },
];

describe(name, () => {
  beforeAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  cases.forEach(({ name, uri, destination }) => {
    describe(name, () => {
      it("should retrieve a dependency", async () => {
        const dependency = new HTTPDependency(
          {
            id: "test",
            uri,
            method: "GET",
            version: "latest",
            destination,
          },
          httpsSource,
        );
        const plan = dependency.plan();
        const downloads = await plan.execute();
        expect(downloads).toHaveLength(1);
        const [downloaded] = downloads;
        expect(downloaded).toBeDefined();

        const filePath = join(root, destination);
        await downloaded.extract(filePath);
        expect(existsSync(filePath)).toBe(true);
      });
    });
  });

  it("should be the same with the snapshot", () => {
    const given = root;
    const expected = join(__dirname, "fixtures/snapshot");
    const compared = compareSync(given, expected);
    expect(compared.same).toBe(true);
  });
});
