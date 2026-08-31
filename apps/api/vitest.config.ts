import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",

    include: [
      "src/modules/**/*.test.ts",
    ],

    exclude: [
      "src/test/integration/**",
    ],

    coverage: {
      provider: "v8",

      reporter: [
        "text",
        "html",
      ],

      include: [
        "src/modules/**/*.ts",
      ],

      exclude: [
        "**/*.test.ts",
        "**/index.ts",
      ],
    },
  },
});