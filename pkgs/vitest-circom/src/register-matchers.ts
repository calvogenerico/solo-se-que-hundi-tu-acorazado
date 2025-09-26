import { expect, inject } from "vitest";
import { CircomCompileError, CircomCompiler, CircomRuntimeError, type CircuitSignals } from "@solose-ts/como-circulo";
import { type ExpectationResult } from "@vitest/expect";
import * as path from "node:path";
import * as os from "node:os";

type CodeAndSignals = {
  source: string,
  signals: CircuitSignals,
}

function assertCircuitSignalValue(obj: unknown, keyName: string, path: string[]): asserts obj is keyof CircuitSignals {
  const newPath = [...path, keyName];
  if (typeof obj === 'string') {
    if (!/^0-9+$/.test(obj)) {
      return
    } else {
      throw new TypeError(`Invalid circom signals. Not numeric value at :${newPath}`);
    }
  }

  if (typeof obj === 'number') {
    throw new TypeError(`Invalid circom signals. Found number found at :${newPath}. Please use bigints or numeric strings`);
  }

  if (typeof obj === 'object') {
    assertCircuitSignals(obj, newPath);
    return
  }

  if (typeof obj === 'bigint') {
    return
  }

  throw TypeError(`Invalid circom signals. Found invalid object at ${newPath}`);
}

function assertCircuitSignals(obj: unknown, path: string[]): asserts obj is CircuitSignals {
  if (obj === null) {
    throw TypeError(`Invalid signales. Found null at ${path}`)
  }
  if (typeof obj !== 'object') {
    throw TypeError(`Invalid signals at ${path}`)
  }

  [...Object.entries(obj)].map(([key, value]) => assertCircuitSignalValue(value, key, path)).every(v => v);
}

class CircomInput {
  public sourceCode: string;
  public signals: CircuitSignals;

  constructor(sourceCode: string, signals: CircuitSignals | undefined) {
    this.sourceCode = sourceCode;
    this.signals = signals || {}; // Default value for signals
  }
}

function parseCodeAndSignals(input: unknown, name: string): CircomInput {
  if (typeof input === 'string') {
    return new CircomInput(input, {});
  }

  if (typeof input !== 'object' || input === null || !input) {
    throw new TypeError(`expected ${name} to be CodeAndSignals but it's not`);
  }

  const casted = input as Partial<CodeAndSignals>;

  assertString(casted.source);
  assertCircuitSignals(casted.signals || {}, []);

  return new CircomInput(casted.source, casted.signals);
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

const libOptions = inject('__vitestCircom_options');

async function wrap(fn: (compiler: CircomCompiler) => Promise<void>, opts: WrapOpts): Promise<ExpectationResult> {
  const handlers = Object.assign({}, defaultHandlers, opts);

  const circomCompilerOpts = libOptions.circomCompilerOpts;
  const compiler = new CircomCompiler(circomCompilerOpts);

  try {
    await fn(compiler);
  } catch (e) {
    if (e instanceof CircomCompileError) {
      return handlers.onCompileError(e)
    }
    if (e instanceof CircomRuntimeError) {
      return handlers.onRuntimeError(e)
    }
    throw e;
  } finally {
    const isTemp = circomCompilerOpts.outDir === undefined || path.relative(circomCompilerOpts.outDir, os.tmpdir());
    if (libOptions.removeTempFiles && isTemp) {
      compiler.clean();
    }
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
});

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

  return wrap(async (compiler) => {
    await compiler.compileStr(sourceCode);
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

  return wrap(async (compiler) => {
    const circuit = await compiler.compileStr(sourceCode);
    await circuit.witness(signals);
  }, {
    onCompileError: failOnCompileError,
    onRuntimeError,
    onSuccess
  });
}

expect.extend({
  toCircomExecOk: async (received) => {
    const input = parseCodeAndSignals(received, 'received');

    return wrap(async (compiler) => {
      const circuit = await compiler.compileStr(input.sourceCode);
      await circuit.witness(input.signals);
    }, {});
  },
  toCircomExecAndOutputs: async (received, expectedSignals: string[]) => {
    const input = parseCodeAndSignals(received, 'received');

    return wrap(async (compiler) => {
      const circuit = await compiler.compileStr(input.sourceCode);
      const proof = await circuit.fullProveGroth16(input.signals);
      expect(proof.publicSignals).toEqual(expectedSignals);
    }, {})
  },
  toCircomExecAndOutputThat: async (received, signalHandler: (signals: string[]) => void | Promise<void>) => {
    const input = parseCodeAndSignals(received, 'received');

    return wrap(async (compiler) => {
      const circuit = await compiler.compileStr(input.sourceCode);
      const proof = await circuit.fullProveGroth16(input.signals);
      await signalHandler(proof.publicSignals);
    }, {})
  },
  toCircomCompileError: async (received: unknown) => {
    const input = parseCodeAndSignals(received, 'received');
    return compileWithError(input.sourceCode, async () => {
    });
  },
  toCircomCompileErrorThat: async (received: unknown, handler: (e: CircomCompileError) => void | Promise<void>) => {
    const input = parseCodeAndSignals(received, 'received');
    return compileWithError(input.sourceCode, handler);
  },
  toCircomExecWithError: async (received: any) => {
    const input = parseCodeAndSignals(received, 'received');
    return execWithError(input, {}, async () => {
    });
  },
  toCircomExecWithErrorThat: async (received: any, handler: (e: CircomRuntimeError) => void | Promise<void>) => {
    const input = parseCodeAndSignals(received, 'received');
    return execWithError(input.sourceCode, {}, handler);
  }
});
