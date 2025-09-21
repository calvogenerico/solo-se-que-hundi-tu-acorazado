import type { Vite, VitestPluginContext } from "vitest/node";
import { join } from "node:path";
import { type CircomCompilerOpts } from "@solose-ts/am-i-testing";

declare module 'vitest' {
  export interface ProvidedContext {
    circomCompilerOpts: CircomCompilerOpts;
  }
}

export default function useCircomCompiler(circomCompilerOpts: CircomCompilerOpts = {}): Vite.Plugin {
  return {
    name: 'vitest:my-super-plugin',
    config: () => ({
      test: {
        setupFiles: [join(import.meta.dirname, 'super-setup.ts')]
      },
    }),
    configureVitest(context: VitestPluginContext) {
      context.vitest.provide('circomCompilerOpts', circomCompilerOpts);
    }
    // configureVitest(context: VitestPluginContext) {
    //   context.vitest.glo
    // }
  };
}
