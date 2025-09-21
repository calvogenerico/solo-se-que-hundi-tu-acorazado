import { defineConfig } from "vitest/config";
import { useCircomCompiler } from "@solose-ts/vitest-circom";
import path from "node:path";

export default defineConfig({
  test: {
    exclude: [],
    include: ['tests/**/*.test.ts']
  },
  plugins: [useCircomCompiler({
    cwd: import.meta.dirname,
    ptauPath: path.join('tests', 'fixture', 'powersoftau_09.ptau'),
    compilerPath: path.join(import.meta.dirname, '..', '..', 'circom'),
    libraryRoots: [
      path.join('circuits'),
      path.join('node_modules'),
    ]
  })]
});
