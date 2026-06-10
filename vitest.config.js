const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["backend/**/*.test.js"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html", "cobertura"],
      reportsDirectory: "coverage",
      include: ["backend/server.js"],
      exclude: ["**/*.test.js", "**/node_modules/**"]
    }
  }
});
