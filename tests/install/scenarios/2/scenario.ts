import { join } from "path";
import { Scenario } from "@tests/scenario";

const scenario: Scenario = {
  name: "Scenario #2",
  command: "install --silent",
  given: join(__dirname, "given"),
  project: join(__dirname, "project"),
  expected: {
    output: join(__dirname, "expected"),
  },
};

export default scenario;
