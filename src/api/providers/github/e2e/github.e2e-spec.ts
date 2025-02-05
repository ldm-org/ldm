import dotenv from "dotenv";
import { findUpSync } from "find-up";
import { compareSync } from "dir-compare";
import { basename, dirname, join } from "path";
import { existsSync, rmSync } from "fs";
import { readFileOrNullSync } from "@/utils";
import { GithubSource } from "../source";
import { GithubDependency } from "../dependency";

const name = "GithubDependency:E2E";

const WORKSPACE_ROOT = dirname(findUpSync("package.json", { cwd: __dirname })!);
const root = join(WORKSPACE_ROOT, "tmp", name);

const dirents = [
  "logo.png", // Binary file
  "lib/functions", // Directory
  "lib/primitive/index.ts", // TypeScript file
];

const cases = [
  {
    version: "latest",
    dirents,
    expected: {
      snapshot: null,
    },
  },
  {
    version: "^9.0.0",
    dirents,
    expected: {
      snapshot: join(__dirname, "fixtures/snapshots", "^9.0.0"),
    },
  },
  {
    version: "9.4.0",
    dirents,
    expected: {
      snapshot: join(__dirname, "fixtures/snapshots", "9.4.0"),
    },
  },
  {
    version: "d02bf22797faea6a46984457687ef2ba6fb46b6f",
    dirents,
    expected: {
      snapshot: join(
        __dirname,
        "fixtures/snapshots",
        "d02bf22797faea6a46984457687ef2ba6fb46b6f",
      ),
    },
  },
];

describe(name, () => {
  beforeAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  cases.forEach(({ version, dirents, expected }) => {
    describe(version, () => {
      dirents.forEach(dirent => {
        it(`should create ${dirent}`, { timeout: 30000 }, async () => {
          const destination = join(root, version, basename(dirent));
          const dependency = new GithubDependency(
            {
              id: "test",
              uri: `${tsEssentials.id}:///${dirent}`,
              version,
              destination,
            },
            tsEssentials,
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

const env = dotenv.parse(
  readFileOrNullSync(join(WORKSPACE_ROOT, ".env"), "utf-8") ?? "",
);

const tsEssentials = new GithubSource({
  id: "@ts-essentials/ts-essentials",
  provider: "github",
  uri: "ts-essentials/ts-essentials",
  auth: {
    token: env.GITHUB_TOKEN,
  },
});
