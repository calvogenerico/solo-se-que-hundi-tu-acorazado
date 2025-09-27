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
import { defineConfig } from 'vitest/config';
import { useCircomCompiler } from '@solose-ts/vitest-circom';
import path from 'node:path';

export default defineConfig({
  test: {
    exclude: [],
    include: ['tests/**/*.test.ts']
  },
  plugins: [
    useCircomCompiler({
      removeTempFiles: false, // false by default
      circomCompilerOpts: {
        cwd: import.meta.dirname, // Use package root as root for `cwd` for circom compiler
        ptauPath: path.join('path', 'to', 'valid', 'powersoftaufile.ptau'),
        libraryRoots: [
          path.join('your', 'circuits', 'folder'),
          path.join('node_modules') // To use circomlib, etc.
        ]
      }
    })
  ]
});
```

### `removeTempFiles`

Once the pluggin is added a set of special matchers will be avialble.
In order to assert over the circuits a bunch of files have to be created. By default a new temporary folder
is created for each test and just stays there. The option `removeTEmpFiles` ensures every temp folder
is removed after it's use instead leaving it there for the os to clean.

### `circomCompilerOpts`

Under the hood this library uses [`@ts-solose/como-circulo`](../como-circulo/README.md) which provide an abstraction
over the circom compiler.
This object is sent to the `CircomCompiler` option as configuration.

Because vitest uses heavy use of parallelism is hard to share a single instance of the `CircomCompiler` object.
That's why instead the configuration for the object is sent around, and a new compiler is created each time.

## Usage

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

Every matcher can assert over 2 kind of object:

- A string with valid source code:

```ts
it('can assert that a snippet execs ok', () => {
  expect(dedent`
        pragma circom 2.2.2;
        template Test() {
            signal a <== 10;
            a === 10;
        }
        component main = Test();
    `).toCircomExecOk();
});
```

- An object like this:

```ts
import { CircuitSignals } from 'snarkjs';

type SourceAndSignals = {
  source: string;
  signals?: CircuitSignals;
};
```

This is how a basic test looks like:

```ts
it('can assert that a snippet execs ok', () => {
  expect(dedent`
        pragma circom 2.2.2;
        template Test() {
            signal a <== 10;
            a === 10;
        }
        component main = Test();
    `).toCircomExecOk();
});
```

> [!NOTE]
> [`dedent`](https://github.com/dmnd/dedent) is not required. It's just a nice helper to make the inline source code
> look nicer.

The matcher `toCircomExecl` will compile the source code and try to calculate the witness. It will
pass if generating the witness pass.

In case inputs signals are needed it can be executed like this:

```ts
it('can assert that a snippet execs ok', () => {
  expect({
    source: dedent`
            pragma circom 2.2.2;
            template Test() {
                input signal in;
                in === 10;
            }
            component main = Test();
        `,
    signals: { a: 10 } // Optional property. If not present `{}` is use by default.
  }).toCircomExecOk();
});
```

This is going to assert that the circuit compiles ok and can generate the witness using the specified input signals.
The format for the input signals is the same used in snarkjs.

There are other matchers that allow to check and assert over possible errors

```ts
it('can assert that a snippet compiles ok but produces error during execution', () => {
  expect({
    source: dedent`
            pragma circom 2.2.2;
            template Test() {
                4 === 40;
            }
            component main = Test();
            `
  }).toCircomExecWithError();
});

it('can assert that a snippet compiles with error', () => {
  expect({
    source: dedent`
            pragma circom 2.2.2;
            template Test() {
                4 === 40;
            }
            component main = Test();
            `
  }).toCircomExecWithError();
});
```

You can find more examples of how to use all the matchers in the [test suite](./tests/matchers.test.ts) or
the [acorazado project](../../pkgs/acorazado/tests).
