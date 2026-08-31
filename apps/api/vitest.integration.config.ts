export default {
  test: {
    environment: "node",
    fileParallelism: false,

    include: [
      "src/modules/**/test/*.integration.test.ts",
    ],

    setupFiles: [
      "src/test/setup.ts",
    ],
  },
};
