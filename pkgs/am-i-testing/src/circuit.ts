import { readFile, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import { wtns, type CircuitSignals } from 'snarkjs';
import { Witness } from "./witness.ts";
import type { Option } from "nochoices";
import { zKey } from 'snarkjs';
import { random } from "nanoid";
import { existsSync } from 'node:fs';

export class Circuit {
  mainFilePath: string;
  inputsFilePath: string;
  artifactDir: string;
  private name: string;
  private ptauPath: Option<string>;

  constructor(mainPath: string, inputsFilePath: string, artifactDir: string, ptauPath: Option<string>) {
    this.mainFilePath = mainPath;
    this.inputsFilePath = inputsFilePath;
    this.artifactDir = artifactDir;
    this.name = parse(this.mainFilePath).name;
    this.ptauPath = ptauPath;
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

  async witness(inputsObj: CircuitSignals): Promise<Witness> {
    await this.setInput(inputsObj);
    const text = await readFile(this.inputPath()).then(buf => buf.toString());
    const outPath = this.witnessPath();
    await wtns.calculate(
      JSON.parse(text) as CircuitSignals,
      join(this.artifactDir, `${this.name}_js`, `${this.name}.wasm`),
      outPath
    );

    return new Witness(outPath, this);
  }

  async generateGroth16Zkey(contributionName = 'anon'): Promise<string> {
    if (existsSync(this.zkeyFinalPath())) {
      return this.zkeyFinalPath();
    }

    await zKey.newZKey(
      this.r1csPath(),
      this.ptauPath.expect(new Error("Missing ptau path")),
      this.zkeyInitialPath(),
    );

    await zKey.contribute(
      this.zkeyInitialPath(),
      this.zkeyPath(1),
      contributionName,
      Buffer.from(random(32)).toString('base64')
    );

    await zKey.beacon(
      this.zkeyPath(1),
      this.zkeyFinalPath(),
      contributionName,
      Buffer.from(random(32)).toString('hex'),
      10
    );

    return this.zkeyFinalPath();
  }

  zkeyInitialPath(): string {
    return this.zkeyPath(0);
  }

  zkeyPath(index: number): string {
    return join(this.artifactDir, `${this.name}.${index.toString().padStart(3, '0')}.zkey`)
  }

  zkeyFinalPath(): string {
    return join(this.artifactDir, `${this.name}.final.zkey`)
  }

  witnessPath(): string {
    return join(this.artifactDir, `trace.wts`);
  }
}
