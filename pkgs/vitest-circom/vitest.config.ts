import { defineConfig } from "vitest/config";
import path from "node:path";
import { useCircomCompiler } from "./src/index.js";

export default defineConfig({
  test: {
    exclude: [],
    include: ['tests/**/*.test.ts']
  },
  plugins: [useCircomCompiler({
    circomCompilerOpts: {
      cwd: import.meta.dirname,
      ptauPath: path.join('tests', 'ptau', 'powersoftau_09.ptau'),
    }
  })]
});
