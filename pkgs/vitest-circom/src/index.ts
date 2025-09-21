import type { Vite, VitestPluginContext } from "vitest/node";
import { type CircomCompilerOpts } from "@solose-ts/como-circulo";


declare module 'vitest' {
  export interface ProvidedContext {
    circomCompilerOpts: CircomCompilerOpts;
  }
}

export function useCircomCompiler(circomCompilerOpts: CircomCompilerOpts = {}): Vite.Plugin {
  return {
    name: 'vitest:my-super-plugin',
    config: () => ({
      test: {
        setupFiles: [import.meta.resolve('./register-matchers.js')]
      },
    }),
    configureVitest(context: VitestPluginContext) {
      context.vitest.provide('circomCompilerOpts', circomCompilerOpts);
    }
  };
}

