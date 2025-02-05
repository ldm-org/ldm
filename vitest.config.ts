import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [tsconfigPaths(), topLevelAwait()],
  test: {
    globals: true,
    root: "./",
  },
});
