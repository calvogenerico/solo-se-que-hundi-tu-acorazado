import { expect, inject } from "vitest";
import { CircomCompileError, CircomCompiler, CircomRuntimeError, type CircuitSignals } from "@solose-ts/como-circulo";
import { type ExpectationResult } from "@vitest/expect";

type CodeAndSignals = {
  source: string,
  signals: CircuitSignals,
}

function assertCodeAndSignals(input: unknown, name: string): asserts input is CodeAndSignals {
  if (typeof input !== 'object' || input === null || !input) {
    throw new TypeError(`expected ${name} to be CodeAndSignals but it's not`);
  }

  const casted = input as Partial<CodeAndSignals>;

  if (typeof casted.source !== 'string') {
    throw new TypeError(`expected ${name} to be CodeAndSignals but it's not`);
  }

  if (typeof casted.signals !== 'object') {
    throw new TypeError(`expected ${name} to be CodeAndSignals but it's not`);
  }
}

function assertString(input: unknown): asserts input is string {
  if (typeof input !== 'string') {
    throw new TypeError(`Expected to receive a string with valid circom source code. Receieved: ${input}`)
  }
}

type CompileErrorHandler = (err: CircomCompileError) => Promise<ExpectationResult> | ExpectationResult;
type RuntimeErrorHandler = (err: CircomRuntimeError) => Promise<ExpectationResult> | ExpectationResult;
type SuccessHandler = () => Promise<ExpectationResult> | ExpectationResult

type WrapOpts = {
  onCompileError?: CompileErrorHandler;
  onRuntimeError?: RuntimeErrorHandler;
  onSuccess?: SuccessHandler;
}

async function wrap(fn: () => Promise<void>, opts: WrapOpts): Promise<ExpectationResult> {
  const handlers = Object.assign({}, defaultHandlers, opts);

  try {
    await fn();
  } catch (e) {
    if (e instanceof CircomCompileError) {
      return handlers.onCompileError(e)
    }
    if (e instanceof CircomRuntimeError) {
      return handlers.onRuntimeError(e)
    }
    throw e;
  }

  return handlers.onSuccess();
}

const failOnCompileError: CompileErrorHandler = (e) => ({
  pass: false,
  message: () => `CompileError:\n\n${e.message}`
})

const failOnRuntimeError: RuntimeErrorHandler = (e): ExpectationResult => ({
  pass: false,
  message: () => `RuntimeError:\n\n${e.message}`
})

function compiler(): CircomCompiler {
  const opts = inject('circomCompilerOpts');
  return new CircomCompiler(opts);
}

const returnSuccess = (): ExpectationResult => {
  return {
    pass: true,
    message: () => 'ok'
  }
};

const defaultHandlers = {
  onCompileError: failOnCompileError,
  onRuntimeError: failOnRuntimeError,
  onSuccess: returnSuccess
};

async function compileWithError(sourceCode: string, handler: (e: CircomCompileError) => Promise<void> | void): Promise<ExpectationResult> {
  const onCompileError = async (err: CircomCompileError) => {
    await handler(err);
    return {
      pass: true,
      message: () => 'ok'
    }
  }

  const failOnSuccess = () => {
    return {
      pass: false,
      message: () => 'Expected to fail to compile, but compilation went ok'
    }
  }

  return wrap(async () => {
    await compiler().compileStr(sourceCode);
  }, {
    onCompileError,
    onSuccess: failOnSuccess
  });
}

async function execWithError(sourceCode: unknown, signals: CircuitSignals, handler: (e: CircomRuntimeError) => void | Promise<void>): Promise<ExpectationResult> {
  if (typeof sourceCode !== 'string') {
    throw new TypeError(`Expected to receive a string with valid circom source code. Receieved: ${sourceCode}`)
  }

  const onRuntimeError = async (err: CircomRuntimeError) => {
    await handler(err);
    return {
      pass: true,
      message: () => 'ok'
    }
  }

  const onSuccess = () => {
    return {
      pass: false,
      message: () => 'Expected to fail to execute, but execution went ok'
    }
  }

  return wrap(async () => {
    const circuit = await compiler().compileStr(sourceCode);
    await circuit.witness(signals);
  }, {
    onCompileError: failOnCompileError,
    onRuntimeError,
    onSuccess
  });
}

expect.extend({
  toCircomExecOk: async (sourceCode) => {
    if (typeof sourceCode !== 'string') {
      throw new TypeError(`Expected to receive a string with valid circom source code. Receieved: ${sourceCode}`)
    }

    return wrap(async () => {
      const circuit = await compiler().compileStr(sourceCode);
      await circuit.witness({});
    }, {});
  },
  toCircomExecOkWithSignals: async (codeAndSignals) => {
    assertCodeAndSignals(codeAndSignals, 'received');

    return wrap(async () => {
      const circuit = await compiler().compileStr(codeAndSignals.source);
      await circuit.witness(codeAndSignals.signals);
    }, {});
  },
  toCircomExecAndOutputs: async (sourceCode, expectedSignals: string[]) => {
    if (typeof sourceCode !== 'string') {
      throw new TypeError(`Expected to receive a string with valid circom source code. Receieved: ${sourceCode}`)
    }

    return wrap(async () => {
      const circuit = await compiler().compileStr(sourceCode);
      const proof = await circuit.fullProveGroth16({});
      expect(proof.publicSignals).toEqual(expectedSignals);
    }, {})
  },
  toCircomExecAndOutputThat: async (sourceCode, signalHandler: (signals: string[]) => void | Promise<void>) => {
    if (typeof sourceCode !== 'string') {
      throw new TypeError(`Expected to receive a string with valid circom source code. Receieved: ${sourceCode}`)
    }

    return wrap(async () => {
      const circuit = await compiler().compileStr(sourceCode);
      const proof = await circuit.fullProveGroth16({});
      await signalHandler(proof.publicSignals);
    }, {})
  },
  toCircomCompileError: async (sourceCode: unknown) => {
    assertString(sourceCode);
    return compileWithError(sourceCode, async () => {
    });
  },
  toCircomCompileErrorThat: async (sourceCode: any, handler: (e: CircomCompileError) => void | Promise<void>) => {
    assertString(sourceCode);
    return compileWithError(sourceCode, handler);
  },
  toCircomExecWithError: async (sourceCode: any) => {
    assertString(sourceCode);
    return execWithError(sourceCode, {}, async () => {
    });
  },
  toCircomExecWithErrorThat: async (sourceCode: any, handler: (e: CircomRuntimeError) => void | Promise<void>) => {
    assertString(sourceCode);
    return execWithError(sourceCode, {}, handler);
  },
  toCircomExecWithSignalsAndError: async (input: unknown) => {
    assertCodeAndSignals(input, 'received');
    return execWithError(input.source, input.signals, async () => {});
  },
  toCircomExecWithSignalsAndErrorThat: async (input: unknown, handler: (e: CircomRuntimeError) => void | Promise<void>) => {
    assertCodeAndSignals(input, 'received');
    return execWithError(input.source, input.signals, handler);
  }
});

