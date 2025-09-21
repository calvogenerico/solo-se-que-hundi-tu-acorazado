import { expect, inject } from "vitest";
import { CircomCompileError, CircomCompiler, CircomRuntimeError, type CircuitSignals } from "@solose-ts/am-i-testing";
import { type ExpectationResult } from "@vitest/expect";

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

async function wrap<T>(fn: () => Promise<void>): Promise<ExpectationResult> {
  try {
    await fn();
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
    pass: true,
    message: () => 'ok'
  }
}

function compiler(): CircomCompiler {
  const opts = inject('circomCompilerOpts');
  return new CircomCompiler(opts);
}



expect.extend({
  toCircomExecOk: async (sourceCode) => {
    if (typeof sourceCode !== 'string') {
      throw new TypeError(`Expected to receive a string with valid circom source code. Receieved: ${sourceCode}`)
    }

    return wrap(async () => {
      const circuit = await compiler().compileStr(sourceCode);
      await circuit.witness({});
    });
  },
  toCircomExecOkWithSignals: async (codeAndSignals) => {
    isCodeAndSignals(codeAndSignals, 'received');

    return wrap(async () => {
      const circuit = await compiler().compileStr(codeAndSignals.source);
      await circuit.witness(codeAndSignals.signals);
    });
  },
  toCircomExecAndOutputs: async (sourceCode, expectedSignals: string[]) => {
    if (typeof sourceCode !== 'string') {
      throw new TypeError(`Expected to receive a string with valid circom source code. Receieved: ${sourceCode}`)
    }

    return wrap(async () => {
      const circuit = await compiler().compileStr(sourceCode);
      const proof = await circuit.fullProveGroth16({});
      expect(proof.publicSignals).toEqual(expectedSignals);
    })
  }
});

interface CircomMatchers<R = unknown> {
  toCircomExecOk: () => Promise<R>
  toCircomExecOkWithSignals: () => Promise<R>
  toCircomExecAndOutputs: (expectedSignals: string[]) => Promise<R>
}

declare module 'vitest' {
  interface Assertion<T = any> extends CircomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CircomMatchers {}
}
