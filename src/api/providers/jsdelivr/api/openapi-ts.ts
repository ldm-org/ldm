import { join } from "path";
import { createClient } from "@hey-api/openapi-ts";

const root = __dirname;

createClient({
  input: join(root, "openapi.json"),
  output: join(root, "client"),
  plugins: ["@hey-api/client-axios"],
});
