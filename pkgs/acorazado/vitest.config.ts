import { defineConfig } from "vitest/config";
import useCircomCompiler from "./plugins/use-circom-compiler.ts";
import path from "node:path";

export default defineConfig({
  test: {
    exclude: [],
    include: ['tests/**/*.test.ts']
  },
  plugins: [useCircomCompiler({
    cwd: import.meta.dirname,
    ptauPath: path.join('tests', 'fixture', 'powersoftau_09.ptau'),
    libraryRoots: [
      path.join('circuits'),
      path.join('node_modules'),
    ]
  })]
});
