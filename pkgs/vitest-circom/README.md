# @solose-ts/vitest-circom

Vitest plugin to have ergonomic circom circuits testing

## Install

```
# pnpm
pnpm add -D @solose-ts/vitest-circom

# yarn
yarn add -D @solose-ts/vitest-circom

# npm
npm add -D @solose-ts/vitest-circom

# bun
bun add -D @solose-ts/vitest-circom
```

## config

```ts
import { defineConfig } from "vitest/config";
import { useCircomCompiler } from "@solose-ts/vitest-circom";
import path from "node:path";

export default defineConfig({
  test: {
    exclude: [],
    include: ['tests/**/*.test.ts']
  },
  plugins: [useCircomCompiler({
    circomCompilerOpts: {
      cwd: import.meta.dirname, // Use package root as root for `cwd` for circom compiler
      ptauPath: path.join('path', 'to', 'valid', 'powersoftaufile.ptau'),
      libraryRoots: [
        path.join('your', 'circuits', 'folder'),
        path.join('node_modules'), // To use circomlib, etc.
      ]
    }
  })]
});
```

Once this plugin is added the following matchers will be available:


```ts
interface Assertion<T = any> {
    toCircomExecOk: () => Promise<T>;
    toCircomExecAndOutputs: (expectedSignals: string[]) => Promise<T>;
    toCircomExecAndOutputThat: (signalHandler: (signals: string[]) => void | Promise<void>) => Promise<T>;
    toCircomCompileError: () => Promise<T>;
    toCircomCompileErrorThat: (handler: (e: CircomCompileError) => void | Promise<void>) => Promise<T>;
    toCircomExecWithError: () => Promise<T>;
    toCircomExecWithErrorThat: (handler: (e: CircomRuntimeError) => void | Promise<void>) => Promise<T>;
}
```

You can find example of how to use them in the [test suite](./tests/matchers.test.ts)
