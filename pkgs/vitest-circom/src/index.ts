import type { Vite, VitestPluginContext } from "vitest/node";
import { type CircomCompileError, type CircomCompilerOpts, type CircomRuntimeError } from "@solose-ts/como-circulo";
import { join } from "node:path";
import { sourceDir } from "./src-dir.cjs";

interface StringCircomMatchers {
  toCircomExecOk: () => Promise<string>
}

interface CircomMatchers<R = unknown> {
  toCircomExecOk: () => Promise<R>
  toCircomExecAndOutputs: (expectedSignals: string[]) => Promise<R>
  toCircomExecAndThat: (signalHandler: (signals: string[]) => void | Promise<void>) => Promise<R>
  toCircomCompileError: () => Promise<R>
  toCircomCompileErrorThat: (handler: (e: CircomCompileError) => void | Promise<void>) => Promise<R>
  toCircomExecWithError: () => Promise<R>
  toCircomExecWithErrorThat: (handler: (e: CircomRuntimeError) => void | Promise<void>) => Promise<R>
}

declare module 'vitest' {
  export interface ProvidedContext {
    __vitestCircom_options: UseCircomOptions;
  }

  interface Assertion<T = any> extends CircomMatchers<T> {
  }

  interface Assertion<T extends string> extends StringCircomMatchers {
  }

  interface AsymmetricMatchersContaining extends CircomMatchers {
  }
}

export type UseCircomOptions = {
  circomCompilerOpts: CircomCompilerOpts,
  removeTempFiles: boolean;
}

const defaultOpts: UseCircomOptions = {
  circomCompilerOpts: {},
  removeTempFiles: false
}

export function useCircomCompiler(givenOptions: Partial<UseCircomOptions> = defaultOpts): Vite.Plugin {
  const opts = Object.assign({}, defaultOpts, givenOptions);
  console.log(join(sourceDir, 'register-matchers.js'));
  return {
    name: 'vitest:my-super-plugin',
    config: () => ({
      test: {
        setupFiles: [join(sourceDir, 'register-matchers.js')]
      },
    }),
    configureVitest(context: VitestPluginContext) {
      context.vitest.provide('__vitestCircom_options', opts);
    }
  };
}

