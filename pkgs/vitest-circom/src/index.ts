import type { Vite, VitestPluginContext } from "vitest/node";
import { type CircomCompileError, type CircomCompilerOpts, type CircomRuntimeError } from "@solose-ts/como-circulo";

interface CircomMatchers<R = unknown> {
  toCircomExecOk: () => Promise<R>
  toCircomExecOkWithSignals: () => Promise<R>
  toCircomExecAndOutputs: (expectedSignals: string[]) => Promise<R>
  toCircomCompileError: () => Promise<R>
  toCircomCompileErrorThat: (handler: (e: CircomCompileError) => void | Promise<void>) => Promise<R>
  toCircomExecWithError: () => Promise<R>
  toCircomExecWithErrorThat: (handler: (e: CircomRuntimeError) => void | Promise<void>) => Promise<R>
}

declare module 'vitest' {
  export interface ProvidedContext {
    circomCompilerOpts: CircomCompilerOpts;
  }

  interface Assertion<T = any> extends CircomMatchers<T> {
  }

  interface AsymmetricMatchersContaining extends CircomMatchers {
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

