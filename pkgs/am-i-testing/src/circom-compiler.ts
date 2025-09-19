import { temporaryDirectory } from "tempy";
import { nanoid } from "nanoid";
import { join } from "node:path";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { Circuit } from "./circuit.ts";
import { Option } from "nochoices";
import { exec as nodeExec } from "node:child_process";
import { promisify } from 'node:util';

const exec = promisify(nodeExec);

type CircomCompilerOpts = {
  compilerPath?: string;
  outDir?: string;
  cwd?: string;
  ptauPath?: string;
};

export class CircomCompiler {
  private circomPath: string
  private outDir: string;
  private ptauPath: Option<string>;
  private libraryRoots: string[];

  constructor(opts: CircomCompilerOpts = {}) {
    this.circomPath = opts.compilerPath ?? 'circom';
    this.outDir = opts.outDir ?? temporaryDirectory();
    this.ptauPath = Option.fromNullable(opts.ptauPath);
    this.libraryRoots = [];
  }

  libraryRoot(dir: string) {
    return this.libraryRoots.push(dir);
  }

  async compileStr(source: string, name?: string): Promise<Circuit> {
    const id = name ?? nanoid(8);

    const outputPat = join(this.outDir, id);
    await mkdir(outputPat, {recursive: true});
    const mainFilePath = join(await this.tempInputDir(), `${id}.circom`);
    const inputsFilePath = join(await this.tempInputDir(), `${id}-input.json`);
    await writeFile(mainFilePath, source);

    const libsCmd = this.libraryRoots.map(root => [ '-l', root ]).flat().join(' ');

    await exec(`${this.circomPath} ${mainFilePath} ${libsCmd} --r1cs --wasm --sym -o ${outputPat}`);

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
