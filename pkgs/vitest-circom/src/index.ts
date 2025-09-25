import type { Vite, VitestPluginContext } from "vitest/node";
import { type CircomCompileError, type CircomCompilerOpts, type CircomRuntimeError } from "@solose-ts/como-circulo";
import { join } from "node:path";
import { sourceDir } from "./src-dir.cjs";

interface CircomMatchers<R = unknown> {
  toCircomExecOk: () => Promise<R>
  toCircomExecOkWithSignals: () => Promise<R>
  toCircomExecAndOutputs: (expectedSignals: string[]) => Promise<R>
  toCircomExecAndThat: (signalHandler: (signals: string[]) => void | Promise<void>) => Promise<R>
  toCircomCompileError: () => Promise<R>
  toCircomCompileErrorThat: (handler: (e: CircomCompileError) => void | Promise<void>) => Promise<R>
  toCircomExecWithError: () => Promise<R>
  toCircomExecWithErrorThat: (handler: (e: CircomRuntimeError) => void | Promise<void>) => Promise<R>
  toCircomExecWithSignalsAndError: () => Promise<R>
  toCircomExecWithSignalsAndErrorThat: (handler: (e: CircomRuntimeError) => void | Promise<void>) => Promise<R>
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
        setupFiles: [join(sourceDir, 'register-matchers.js')]
      },
    }),
    configureVitest(context: VitestPluginContext) {
      context.vitest.provide('circomCompilerOpts', circomCompilerOpts);
    }
  };
}

