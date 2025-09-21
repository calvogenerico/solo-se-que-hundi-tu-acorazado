import { expect, inject } from "vitest";
import { CircomCompileError, CircomCompiler, CircomRuntimeError, type CircuitSignals } from "@solose-ts/am-i-testing";

type CodeAndSignals = {
  source: string,
  signals: CircuitSignals,
}

function isCodeAndSignals(input: any, name: string): asserts input is CodeAndSignals {
  if (typeof input.source !== 'string') {
    throw new TypeError(`expected ${name} to be CodeAndSignals but it's not`);
  }

  if (typeof input.signals !== 'object') {
    throw new TypeError(`expected ${name} to be CodeAndSignals but it's not`);
  }
}

async function execWithSignals(sourceCode: string, signals: CircuitSignals) {
  const opts = inject('circomCompilerOpts');
  const compiler = new CircomCompiler(opts);

  try {
    const circuit = await compiler.compileStr(sourceCode);
    await circuit.witness(signals);
  } catch (e) {
    if (e instanceof CircomCompileError) {
      return {
        pass: false,
        message: () => `Compilation error:\n${e.errorMsg}`
      }
    }
    if (e instanceof CircomRuntimeError) {
      return {
        pass: false,
        message: () => `Error during witness calculation:\n\n${e.execMessage}`
      }
    }
    throw e;
  }

  return {
    message: () => `ok`,
    pass: true,
  }
}

expect.extend({
  toCircomExecOk: async (sourceCode, _received) => {
    if (typeof sourceCode !== 'string') {
      throw new TypeError(`expected to receive a string with valid circom source code. Receieved: ${sourceCode}`)
    }

    return await execWithSignals(sourceCode, {});
  },
  toCircomExecOkWithSignals: async (codeAndSignals, _received) => {
    isCodeAndSignals(codeAndSignals, 'received');

    return execWithSignals(codeAndSignals.source, codeAndSignals.signals);
  }
});

interface CircomMatchers<R = unknown> {
  toCircomExecOk: () => Promise<R>
  toCircomExecOkWithSignals: () => Promise<R>
}

declare module 'vitest' {
  interface Assertion<T = any> extends CircomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CircomMatchers {}
}
