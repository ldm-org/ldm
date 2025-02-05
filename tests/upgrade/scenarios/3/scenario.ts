import { join } from "path";
import { Scenario } from "@tests/scenario";

const scenario: Scenario = {
  name: "Scenario #3",
  command: "upgrade --force --silent",
  given: join(__dirname, "given"),
  project: join(__dirname, "project"),
  expected: {
    error: error => {
      expect(error.message).toContain(
        "Cannot force upgrade all dependencies. Please specify the targets.",
      );
    },
  },
};

export default scenario;
