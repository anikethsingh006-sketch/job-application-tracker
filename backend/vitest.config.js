const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    setupFiles: ["./tests/setup.js"],
    fileParallelism: false,
    sequence: {
      setupFiles: "list",
    },
  },
});
