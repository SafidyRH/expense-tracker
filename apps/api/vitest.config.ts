export default {
  test: {
    environment: "node",

    include: [
      "src/modules/**/test/*.unit.test.ts",
      "src/modules/**/test/*.integration.test.ts",
    ],
    setupFiles: [
      "src/test/setup.ts",
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
        "src/test/**",
        "**/index.ts",
      ],
    },
  },
};
