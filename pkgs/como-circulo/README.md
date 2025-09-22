# @solose-ts/como-circulo

This library contains tooling to compile, execute and prove circom circuits from js/ts code.

The final goal of the library is to facilitate the development of secure and valid circuits.

## Installing

```shell
# pnpm
pnpm add @solose-ts/como-circulo

# yarn
yarn add @solose-ts/como-circulo

# npm
npm add @solose-ts/como-circulo

# bun 
bun add @solose-ts/como-circulo
```

> [!WARNING]
> At the moment the cjs build is not tested. In order to make everything work we recommend
> import it as a module.

## How to use it.

The main abstraction provided is the `CircomCompiler` which is basically a wrapper around
`circom` cli.

The compiler can be used to compile inline snippets or circom files:

```ts
import { CircomCompiler } from '@solose-ts/como-circulo'
import * as path from 'node:path'

const compiler = new CircomCompiler();

const circuit1 = await compiler.compileStr(`
    pragma circom 2.2.2;
    template AbsoluteTruth {
        42 === 42;
    }
    component main = AbsoluteTruth();
`);

const circuit2 = await compiler.compileFile(path.join('path', 'to', 'your', 'source-code.circom'));
```

Circuits can be executed to generate a witness:

```ts
const witness = await circuit.witness({});
```

Witness generation accept input signals. The format of the signals is not type safe. The right format needs to be sent
to avoid having a runtime error.

```ts
const circuit3 = await compiler.compileStr(`
    pragma circom 2.2.2;
    template EnsureAreEqual {
        input signal left;
        input signal right;
        left === right;
    }
    component main = EnsureAreEqual();
`);

const rightWitness = await circuit3.witness({ left: '10', right: '10' }); // Ok!

await circuit3.witness({ doesNotExist: 11 }); // Will fail with `CircomRuntimeError`;
```

Once the witness was calculated it can be used to calculate a proof:

```ts
const proof = await witness.proveGroth16();
console.log(proof);
// {
//   proof: <circom-groth-16-json-prof>,
//   publicSignals: ['signal1', 'signal2', ...]
// }
```

Lastly the proof can be verified.

```ts
const isValid = await circuit.groth16Verify(proof);
console.log(isValid); // `true` or `false`
```



## Options

The object `CircomCompiler` can be initialized with the following parameters:

```ts
export type CircomCompilerOpts = {
    compilerPath?: string;
    outDir?: string;
    cwd?: string;
    ptauPath?: string;
    libraryRoots?: string[];
};
```

### compilerPath

This the location of the `circom` binary. By default it assumes that it's in the path, so it uses `circom` with
no absolute or relative path. If `circom` is not in the path or a particular version has to be used, this the
place to set the path of the correct binary.

### outDir

This is the directory where intermediary files are going to be stored. By default, it's a temporary directory.

### cwd

Current working directory for commands executed by the compiler.

### ptauPath?

Location of a prepared ceremony file. If the ptau path is not present the witness and prove steps
cannot be calculated (will throw with appropriate error);

### libraryRoots

This is the `-l` option on `circom` cli. The most ergonomic way to use the inline snippets to add your circuit root
here. Then your templates can be included in your snippets.
