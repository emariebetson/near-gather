import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      include: ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "json-summary"]
    },
    include: ["packages/**/*.test.ts", "apps/**/*.test.ts"],
    testTimeout: 15_000
  }
});

