import { describe, expect, it } from "vitest";
import { temporaryDirectory } from 'tempy';
import { $ } from "zx";
import { nanoid } from "nanoid";
import { join } from "node:path";
import { mkdir, writeFile, readFile, rm } from 'node:fs/promises'

type CircomCompilerOpts = {
  compilerPath?: string;
  outDir?: string;
  cwd?: string;
};

class Circuit {
  mainFilePath: string;
  inputsFilePath: string;
  artifactDir: string;

  constructor(mainPath: string, inputsFilePath: string, artifactDir: string) {
    this.mainFilePath = mainPath;
    this.inputsFilePath = inputsFilePath;
    this.artifactDir = artifactDir;
  }
}

class CircomCompiler {
  private circomPath: string
  private outDir: string;
  private shell: typeof $;

  constructor(opts: CircomCompilerOpts = {}) {
    this.circomPath = opts.compilerPath ?? 'circom';
    this.outDir = opts.outDir ?? temporaryDirectory()
    this.shell = $({cwd: opts.cwd ?? process.cwd()})
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
      outputPat
    );
  }

  async clean() {
    await rm(this.outDir, { recursive: true });
  }

  private async tempInputDir() {
    const path = join(this.outDir, '_local');
    await mkdir(path, {recursive: true});
    return path;
  }
}


describe('compile cmd', () => {
  it('can compile a simple circuit', async () => {
    const compiler = new CircomCompiler();
    const source = `
pragma circom 2.2.2;
template Test() {}
component main = Test();
    `;
    const circuit = await compiler.compileStr(source);

    const read = await readFile(circuit.mainFilePath);
    expect(read.toString().trim()).toEqual(source.trim());

    await compiler.clean();
  })
})
