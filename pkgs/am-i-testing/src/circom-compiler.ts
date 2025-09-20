import { temporaryDirectory } from "tempy";
import { nanoid } from "nanoid";
import { join, parse } from "node:path";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { Circuit } from "./circuit.js";
import { Option } from "nochoices";
import { exec as nodeExec } from "node:child_process";
import { promisify } from 'node:util';
import { CircomCompileError } from "./errors.js";
import * as process from "node:process";

const exec = promisify(nodeExec);

type ExecErr = {
  code: number;
  stderr: string;
}

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
  private cwd: string;

  constructor(opts: CircomCompilerOpts = {}) {
    this.circomPath = opts.compilerPath ?? 'circom';
    this.outDir = opts.outDir ?? temporaryDirectory();
    this.cwd = opts.cwd ?? process.cwd();
    this.ptauPath = Option.fromNullable(opts.ptauPath).map(ptauPath => join(this.cwd, ptauPath));
    this.libraryRoots = [];
  }

  libraryRoot(dir: string) {
    return this.libraryRoots.push(dir);
  }

  async compileStr(source: string, name?: string): Promise<Circuit> {
    const id = name ?? nanoid(8);

    const mainFilePath = join(await this.tempInputDir(), `${id}.circom`);
    await writeFile(mainFilePath, source);

    return this.compileFile(mainFilePath)
  }

  async compileFile(filePath: string): Promise<Circuit> {
    const parsed = parse(filePath)
    const outputPat = join(this.outDir, parsed.name);
    await mkdir(outputPat, {recursive: true});
    const mainFilePath = filePath;
    const libsCmd = this.libraryRoots.map(root => ['-l', root]).flat().join(' ');

    try {
      const a = await exec('pwd', {cwd: this.cwd})
      await exec(`${this.circomPath} ${mainFilePath} ${libsCmd} --r1cs --wasm --sym -o ${outputPat}`, {cwd: this.cwd});
    } catch (e) {
      const typedError = e as ExecErr;

      throw new CircomCompileError(
        mainFilePath,
        typedError.code,
        typedError.stderr,
      );
    }

    return new Circuit(mainFilePath, outputPat, this.ptauPath);
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
