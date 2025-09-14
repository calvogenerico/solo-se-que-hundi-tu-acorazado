import { readFile, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import { wtns, type CircuitSignals } from 'snarkjs';

export class Circuit {
  mainFilePath: string;
  inputsFilePath: string;
  artifactDir: string;
  private name: string;

  constructor(mainPath: string, inputsFilePath: string, artifactDir: string) {
    this.mainFilePath = mainPath;
    this.inputsFilePath = inputsFilePath;
    this.artifactDir = artifactDir;
    this.name = parse(this.mainFilePath).name;
  }

  async symFile(): Promise<string> {
    return readFile(join(this.artifactDir, `${this.name}.sym`)).then(buf => buf.toString());
  }

  r1csPath(): string {
    return join(this.artifactDir, `${this.name}.r1cs`);
  }

  async setInput(inputsObj: CircuitSignals): Promise<void> {
    await writeFile(this.inputPath(), JSON.stringify(inputsObj, null, 2));
  }

  inputPath(): string {
    return join(this.artifactDir, `witness-inputs.json`);
  }

  async witness(): Promise<string> {
    const text = await readFile(this.inputPath()).then(buf => buf.toString());
    const outPath = this.witnessPath();
    await wtns.calculate(
      JSON.parse(text) as CircuitSignals,
      join(this.artifactDir, `${this.name}_js`, `${this.name}.wasm`),
      outPath
    );

    return outPath;
  }

  witnessPath(): string {
    return join(this.artifactDir, `trace.wts`);
  }
}
