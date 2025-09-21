import { expect, inject } from "vitest";
import { CircomCompileError, CircomCompiler, CircomRuntimeError, type CircuitSignals } from "@solose-ts/como-circulo";
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

type WrapOpts = {
  onCompileError?: (err: CircomCompileError) => Promise<ExpectationResult> | ExpectationResult
  onRuntimeErrorError?: (err: CircomRuntimeError) => Promise<ExpectationResult> | ExpectationResult
  onSuccess: () => Promise<ExpectationResult> | ExpectationResult
}

async function wrap(fn: () => Promise<void>, opts: WrapOpts): Promise<ExpectationResult> {
  try {
    await fn();
  } catch (e) {
    if (e instanceof CircomCompileError) {
      if (opts.onCompileError === undefined) {
        return {
          pass: false,
          message: () => `Compilation error:\n${e.message}`
        }
      } else {
        return opts.onCompileError(e)
      }
    }
    if (e instanceof CircomRuntimeError) {
      if (opts.onRuntimeErrorError === undefined) {
        return {
          pass: false,
          message: () => `Error during witness calculation:\n\n${e.message}`
        }
      } else {
        return opts.onRuntimeErrorError(e)
      }
    }
    throw e;
  }
  return opts.onSuccess();
}

function compiler(): CircomCompiler {
  const opts = inject('circomCompilerOpts');
  return new CircomCompiler(opts);
}

const returnSuccess = (): ExpectationResult => {
  return {
    pass: true,
    message: () => 'ok'
  }
}

expect.extend({
  toCircomExecOk: async (sourceCode) => {
    if (typeof sourceCode !== 'string') {
      throw new TypeError(`Expected to receive a string with valid circom source code. Receieved: ${sourceCode}`)
    }

    return wrap(async () => {
      const circuit = await compiler().compileStr(sourceCode);
      await circuit.witness({});
    }, {onSuccess: returnSuccess});
  },
  toCircomExecOkWithSignals: async (codeAndSignals) => {
    isCodeAndSignals(codeAndSignals, 'received');

    return wrap(async () => {
      const circuit = await compiler().compileStr(codeAndSignals.source);
      await circuit.witness(codeAndSignals.signals);
    }, {onSuccess: returnSuccess});
  },
  toCircomExecAndOutputs: async (sourceCode, expectedSignals: string[]) => {
    if (typeof sourceCode !== 'string') {
      throw new TypeError(`Expected to receive a string with valid circom source code. Receieved: ${sourceCode}`)
    }

    return wrap(async () => {
      const circuit = await compiler().compileStr(sourceCode);
      const proof = await circuit.fullProveGroth16({});
      expect(proof.publicSignals).toEqual(expectedSignals);
    }, {onSuccess: returnSuccess})
  },
  toCircomCompileError: async (sourceCode: string) => {
    const onCompileError = (_err: CircomCompileError) => {
      return {
        pass: true,
        message: () => 'ok'
      }
    }

    const onSuccess = () => {
      return {
        pass: false,
        message: () => 'Expected to fail to compile, but compilation went ok'
      }
    }

    return wrap(async () => {
      await compiler().compileStr(sourceCode);
    }, {onCompileError, onSuccess});
  },
  toCircomCompileErrorThat: async (sourceCode: string, handler: (e: CircomCompileError) => void | Promise<void>) => {
    const onCompileError = async (err: CircomCompileError) => {
      await handler(err);
      return {
        pass: true,
        message: () => 'ok'
      }
    }

    const onSuccess = () => {
      return {
        pass: false,
        message: () => 'Expected to fail to compile, but compilation went ok'
      }
    }

    return wrap(async () => {
      await compiler().compileStr(sourceCode);
    }, {onCompileError, onSuccess});
  }
});

interface CircomMatchers<R = unknown> {
  toCircomExecOk: () => Promise<R>
  toCircomExecOkWithSignals: () => Promise<R>
  toCircomExecAndOutputs: (expectedSignals: string[]) => Promise<R>
  toCircomCompileError: () => Promise<R>
  toCircomCompileErrorThat: (handler: (e: CircomCompileError) => void | Promise<void>) => Promise<R>
}

declare module 'vitest' {
  interface Assertion<T = any> extends CircomMatchers<T> {
  }

  interface AsymmetricMatchersContaining extends CircomMatchers {
  }
}
