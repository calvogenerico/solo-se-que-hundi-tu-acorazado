import { describe, expect, it as baseIt } from "vitest";
import { readFile } from 'node:fs/promises'
import { CircomCompiler } from "../src/circom-compiler.ts";
import { r1cs, wtns } from 'snarkjs';

type Fixture = {
  compiler: CircomCompiler
}

const it = baseIt.extend<Fixture>({
  compiler: async ({}, use) => {
    const compiler = new CircomCompiler();
    use(new CircomCompiler());
    await compiler.clean();
  }
});

// multi line string
function mls(...lines: string[]) {
  return lines.join('\n');
}

describe('compile cmd', () => {
  it('writes source code in disk', async ({compiler}) => {
    const source = mls(
      'pragma circom 2.2.2;',
      'template Test() {}',
      'component main = Test();'
    );

    const circuit = await compiler.compileStr(source);

    const read = await readFile(circuit.mainFilePath);
    expect(read.toString().trim()).toEqual(source.trim());
  });

  it('generates sym file', async ({compiler}) => {
    const source = mls(
      'pragma circom 2.2.2;',
      'template Test() {',
      '  input signal a;',
      '  output signal b;',
      '  b <== a + 1;',
      '}',
      'component main = Test();'
    );

    const circuit = await compiler.compileStr(source);
    const symContent = await circuit.symFile();

    const expectedContent = [
      '1,1,0,main.b',
      '2,2,0,main.a'
    ].join('\n');

    expect(symContent.trim()).toEqual(expectedContent.trim())
  });

  it('produces right r1cs file', async ({compiler}) => {
    const source = mls(
      'pragma circom 2.2.2;',
      'template Test() {',
      '  input signal a;',
      '  output signal b;',
      '  b <== a + 1;',
      '}',
      'component main = Test();'
    );

    const circuit = await compiler.compileStr(source);
    const path = circuit.r1csPath();

    await expect(r1cs.info(path)).resolves.not.toThrow();
  });

  it('can store input in disk', async ({compiler}) => {
    const source = mls(
      'pragma circom 2.2.2;',
      'template Test() {',
      '  input signal a;',
      '  output signal b;',
      '  b <== a + 1;',
      '}',
      'component main = Test();'
    );

    const circuit = await compiler.compileStr(source);
    await circuit.setInput({a: '11'});
    const path = circuit.inputPath();

    const file = await readFile(path);
    expect(JSON.parse(file.toString())).toEqual({a: '11'})
  });

  it('generates witness with proper input', async ({compiler}) => {
    const source = mls(
      'pragma circom 2.2.2;',
      'template Test() {',
      '  input signal a;',
      '  output signal b;',
      '  b <== a + 1;',
      '}',
      'component main = Test();'
    );

    const circuit = await compiler.compileStr(source);
    await circuit.setInput({a: '11'});
    const path = await circuit.witness();

    const file = await readFile(path);
    expect(file.toString()).toMatch(/^wtns/);
    const check = await wtns.check(circuit.r1csPath(), circuit.witnessPath());
    expect(check).toBe(true);
  });
});
