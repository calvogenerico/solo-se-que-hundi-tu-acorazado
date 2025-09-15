import { $ } from "zx";
import { temporaryDirectory } from "tempy";
import { nanoid } from "nanoid";
import { join } from "node:path";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { Circuit } from "./circuit.ts";
import { Option } from "nochoices";

type CircomCompilerOpts = {
  compilerPath?: string;
  outDir?: string;
  cwd?: string;
  ptauPath?: string;
};

export class CircomCompiler {
  private circomPath: string
  private outDir: string;
  private shell: typeof $;
  private ptauPath: Option<string>;

  constructor(opts: CircomCompilerOpts = {}) {
    this.circomPath = opts.compilerPath ?? 'circom';
    this.outDir = opts.outDir ?? temporaryDirectory()
    this.shell = $({cwd: opts.cwd ?? process.cwd()})
    this.ptauPath = Option.fromNullable(opts.ptauPath);
  }

  async compileStr(source: string, name?: string): Promise<Circuit> {
    const id = name ?? nanoid(8);

    const outputPat = join(this.outDir, id);
    await mkdir(outputPat, {recursive: true});
    const mainFilePath = join(await this.tempInputDir(), `${id}.circom`);
    const inputsFilePath = join(await this.tempInputDir(), `${id}-input.json`);
    await writeFile(mainFilePath, source);

    await this.shell`${this.circomPath} ${mainFilePath} --r1cs --wasm --sym -o ${outputPat}`;

    return new Circuit(
      mainFilePath,
      inputsFilePath,
      outputPat,
      this.ptauPath
    );
  }

  async clean() {
    await rm(this.outDir, {recursive: true});
  }

  private async tempInputDir() {
    const path = join(this.outDir, '_local');
    await mkdir(path, {recursive: true});
    return path;
  }
}
