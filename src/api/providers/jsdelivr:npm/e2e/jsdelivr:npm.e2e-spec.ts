import { existsSync, rmSync } from "fs";
import { basename, dirname, join } from "path";
import { findUpSync } from "find-up";
import { compareSync } from "dir-compare";
import { JSDelivrNPMSource } from "../source";
import { JSDelivrNPMDependency } from "../dependency";

const name = "JSDelivrNPMDependency:E2E";

const root = join(
  dirname(findUpSync("package.json", { cwd: __dirname })!),
  "tmp",
  name,
);

const paths = [
  "default", // Default file
  "/src/core.js", // Specific file
  "/src/event", // Specific folder
];

const cases = [
  {
    version: "latest",
    paths,
    minify: false,
    expected: {
      snapshot: null,
    },
  },
  {
    version: "^3.0.0",
    paths,
    minify: false,
    expected: {
      snapshot: join(__dirname, "fixtures/snapshots", "^3.0.0"),
    },
  },
  {
    version: "3.7.1",
    paths,
    minify: false,
    expected: {
      snapshot: join(__dirname, "fixtures/snapshots", "3.7.1"),
    },
  },
  {
    version: "~3.6.0",
    paths: ["/src/core.js"],
    minify: true,
    expected: {
      snapshot: join(__dirname, "fixtures/snapshots", "~3.6.0"),
    },
  },
];

describe(name, () => {
  beforeAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  cases.forEach(({ version, minify, paths, expected }) => {
    describe(version, () => {
      paths.forEach(path => {
        it(`should create ${path}`, async () => {
          const destination = join(root, version, basename(path));
          const dependency = new JSDelivrNPMDependency(
            {
              id: "test",
              uri: `${jquery.id}://${path}`,
              version,
              destination,
              minify,
            },
            jquery,
          );
          const latestVersion = await dependency.getLatestVersion();
          const plan = await dependency.plan({
            version: latestVersion,
          });
          const downloads = await plan.execute();
          for (const download of downloads) {
            await download.extract(destination);
            expect(existsSync(join(destination, download.path))).toBe(true);
          }
        });
      });

      if (expected.snapshot) {
        it("should be the same with snapshot", () => {
          const given = join(root, version);
          const compared = compareSync(given, expected.snapshot);
          expect(compared.same).toBe(true);
        });
      }
    });
  });
});

const jquery = new JSDelivrNPMSource({
  id: "jquery",
  uri: "jquery",
  provider: "jsdelivr:npm",
});
