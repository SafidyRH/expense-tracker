export default {
  test: {
    environment: "node",

    include: [
      "src/modules/**/test/*.unit.test.ts",
      "src/middleware/test/*.test.ts",
      "src/openapi/*.test.ts",
    ],

    setupFiles: [
      "src/test/setup.ts",
    ],
  },
};
