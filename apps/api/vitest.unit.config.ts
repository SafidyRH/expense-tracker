export default {
  test: {
    environment: "node",

    include: [
      "src/modules/**/test/*.unit.test.ts",
      "src/middleware/test/*.test.ts",
    ],

    setupFiles: [
      "src/test/setup.ts",
    ],
  },
};
