export default {
  test: {
    environment: "node",

    include: [
      "src/modules/**/test/*.unit.test.ts",
    ],

    setupFiles: [
      "src/test/setup.ts",
    ],
  },
};
