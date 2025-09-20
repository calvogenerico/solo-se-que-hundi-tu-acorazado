import { readFile, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import { type CircuitSignals, groth16, wtns, zKey } from 'snarkjs';
import { Witness } from "./witness.js";
import type { Option } from "nochoices";
import { random } from "nanoid";
import { existsSync } from 'node:fs';
import type { Proof } from "./proof.ts";
import type { Brand, JsonLike } from "./types.ts";
import { createHash } from 'node:crypto';
import { stringify } from 'canonical-json'
import { CircomRuntimeError } from "./errors.js";

type VerificationKey = Brand<JsonLike, 'vKey'>;

type TypedWitnessError = {
  message?: string;
}

function quickHash(obj: JsonLike, size: number): string {
  const text = stringify(obj);
  return createHash('sha1').update(text, 'ascii').digest('base64url').slice(0, size);
}

export class Circuit {
  mainFilePath: string;
  artifactDir: string;
  private name: string;
  private ptauPath: Option<string>;

  constructor(mainPath: string, artifactDir: string, ptauPath: Option<string>) {
    this.mainFilePath = mainPath;
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
    const text = stringify(this.signalsToJson(inputsObj));
    await writeFile(this.inputPath(inputsObj), text);
  }

  async witness(inputsObj: CircuitSignals): Promise<Witness> {
    await this.setInput(inputsObj);
    const text = await readFile(this.inputPath(inputsObj)).then(buf => buf.toString());
    const outPath = this.witnessPath(inputsObj);

    const inputSignals = JSON.parse(text);
    const wasmPath = join(this.artifactDir, `${this.name}_js`, `${this.name}.wasm`);
    try {
      await wtns.calculate(
        inputSignals as CircuitSignals,
        wasmPath,
        outPath
      );
    } catch (e) {
      const typedError = e as TypedWitnessError;
      throw new CircomRuntimeError(inputSignals, wasmPath, typedError.message);
    }


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

  async fullProveGroth16(inputs: CircuitSignals) {
    const witness = await this.witness(inputs);
    return await witness.proveGroth16();
  }

  async groth16Verify(proof: Proof): Promise<boolean> {
    const vkey = await this.vKey();
    return groth16.verify(vkey, proof.publicSignals, proof.proof)
  }

  async vKey(): Promise<VerificationKey> {
    return zKey.exportVerificationKey(await this.generateGroth16Zkey());
  }

  async saveVkey(): Promise<void> {
    await writeFile(this.vKeyPath(), JSON.stringify(await this.vKey()));
  }

  inputPath(inputsObj: CircuitSignals): string {
    const prefix = this.inputsDigest(inputsObj) ;
    return join(this.artifactDir, `witness-${prefix}.inputs.json`);
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

  witnessPath(inputsObj: CircuitSignals): string {
    const prefix = this.inputsDigest(inputsObj);
    return join(this.artifactDir, `trace-${prefix}.wts`);
  }

  vKeyPath(): string {
    return join(this.artifactDir, `${this.name}.vkey.json`);
  }

  private inputsDigest(inputsObj: CircuitSignals): string {
    return quickHash(this.signalsToJson(inputsObj), 8);
  }

  private signalsToJson(inputsObj: CircuitSignals): JsonLike {
    const string = JSON.stringify(inputsObj, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString()
      }
      return value;
    }, 2);
    return JSON.parse(string);
  }
}
