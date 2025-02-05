import { join } from "path";
import { Scenario } from "@tests/scenario";

const scenario: Scenario = {
  name: "Scenario #6",
  command: "install --frozen-lockfile --silent",
  given: join(__dirname, "given"),
  project: join(__dirname, "project"),
  expected: {
    error: error => {
      expect(error.message).toContain(
        "The lockfile is not up to date while `--frozen-lockfile` is enabled.",
      );
    },
  },
};

export default scenario;
