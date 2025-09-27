import type { Vite, VitestPluginContext } from "vitest/node";
import { type CircomCompileError, type CircomCompilerOpts, type CircomRuntimeError } from "@solose-ts/como-circulo";
import { join } from "node:path";
import { sourceDir } from "./src-dir.cjs";

declare module 'vitest' {
  export interface ProvidedContext {
    __vitestCircom_options: UseCircomOptions;
  }

  // We need to use `any` here to have exactly the same interface defined in vitest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toCircomExecOk: () => Promise<T>
    toCircomExecAndOutputs: (expectedSignals: string[]) => Promise<T>
    toCircomExecAndThat: (signalHandler: (signals: string[]) => void | Promise<void>) => Promise<T>
    toCircomCompileError: () => Promise<T>
    toCircomCompileErrorThat: (handler: (e: CircomCompileError) => void | Promise<void>) => Promise<T>
    toCircomExecWithError: () => Promise<T>
    toCircomExecWithErrorThat: (handler: (e: CircomRuntimeError) => void | Promise<void>) => Promise<T>
  }
}

export type UseCircomOptions = {
  circomCompilerOpts: CircomCompilerOpts,
  removeTempFiles: boolean;
}

const defaultOpts: UseCircomOptions = {
  circomCompilerOpts: {},
  removeTempFiles: false
};

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

