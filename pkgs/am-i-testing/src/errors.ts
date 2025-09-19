export class CircomCompileError extends Error {
  mainPath: string;
  outputCode: number;
  errorMsg: string;
  constructor(entryPath: string, code: number, errorMsg: string) {
    super('error compiling circuit');
    this.mainPath = entryPath;
    this.outputCode = code;
    this.errorMsg = errorMsg;
  }
}

export class CircomRuntimeError extends Error {
  execMessage?: string;
  inputSignals: unknown;
  wasmPath: string;

  constructor(inputSignals: unknown, wasmPath: string, msg?: string) {
    super('error during witness generation');
    this.execMessage = msg;
    this.inputSignals = inputSignals;
    this.wasmPath = wasmPath;
  }
}
