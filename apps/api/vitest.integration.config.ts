import {
  defineConfig,
} from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",

    include: [
      "src/test/integration/**/*.test.ts",
    ],

    setupFiles: [
      "./src/test/setup-env.ts",
    ],

    // Les tests touchent la même DB.
    // On commence volontairement en séquentiel.
    fileParallelism: false,

    maxWorkers: 1,

    testTimeout: 30_000,

    hookTimeout: 30_000,
  },
});