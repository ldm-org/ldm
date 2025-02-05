import { Scenario } from "@tests/scenario";
import { join } from "path";

const scenario: Scenario = {
  name: "Scenario #1",
  command: "upgrade --silent",
  given: join(__dirname, "given"),
  project: join(__dirname, "project"),
  expected: {
    output: join(__dirname, "expected"),
  },
};

export default scenario;
