export class CircomCompileError extends Error {
  mainPath: string;
  outputCode: number;
  constructor(entryPath: string, code: number, errorMsg: string) {
    super(errorMsg);
    this.mainPath = entryPath;
    this.outputCode = code;
  }

  toString() {
    return `Error: ${this.message}`;
  }
}

export class CircomRuntimeError extends Error {
  inputSignals: unknown;
  wasmPath: string;

  constructor(inputSignals: unknown, wasmPath: string, msg?: string) {
    super(msg ?? 'error during witness generation');
    this.inputSignals = inputSignals;
    this.wasmPath = wasmPath;
  }
}
