import shell from "shelljs";
import dotenv from "dotenv";
import merge from "lodash/merge";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { findUpSync } from "find-up";
import { readFileOrNullSync } from "@/utils";
import { ldm } from "@tests/command";
import { Scenario } from "@tests/scenario";
import { compare } from "@tests/compare";
import scenario1 from "./scenarios/1/scenario";
import scenario2 from "./scenarios/2/scenario";
import scenario3 from "./scenarios/3/scenario";
import scenario4 from "./scenarios/4/scenario";
import scenario5 from "./scenarios/5/scenario";
import scenario6 from "./scenarios/6/scenario";

const name = "Install:E2E";

const WORKSPACE_ROOT = dirname(findUpSync("package.json")!);
const envFile = join(WORKSPACE_ROOT, ".env");

describe(name, () => {
  scenarios.forEach(({ name, command, given, project, expected }) => {
    describe(name, () => {
      beforeAll(() => {
        shell.rm("-rf", project);
        shell.mkdir("-p", project);
        shell.cp("-r", `${given}/*`, `${project}/`);
      });

      it("should install the dependencies", { timeout: 30000 }, async () => {
        try {
          await ldm(command, {
            cwd: project,
            env: merge(
              {},
              process.env,
              dotenv.parse(readFileOrNullSync(envFile, "utf-8") ?? ""),
            ),
          });
          expect(true).toBe(true);
        } catch (error) {
          if (expected?.error) {
            expected.error(error);
          } else {
            expect(error).toBeUndefined();
          }
        }
      });

      if (expected?.output && existsSync(expected.output)) {
        it('should be the same as the "expected" directory', () => {
          compare(project, expected.output!);
        });
      }
    });
  });
});

const scenarios: Scenario[] = [
  scenario1,
  scenario2,
  scenario3,
  scenario4,
  scenario5,
  scenario6,
];
