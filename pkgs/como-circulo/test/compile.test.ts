import { describe, expect, it as baseIt } from 'vitest';
import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { CircomCompiler } from '../src/index.js';
import { r1cs, wtns } from 'snarkjs';
import { join } from 'node:path';
import { CircomCompileError, CircomRuntimeError } from '../src/errors.js';
import dedent from 'dedent';
import { temporaryFile } from 'tempy';

type Fixture = {
  compiler: CircomCompiler;
};

const it = baseIt.extend<Fixture>({
  // eslint-disable-next-line no-empty-pattern
  compiler: async ({}, use) => {
    const compiler = new CircomCompiler({
      ptauPath: join(import.meta.dirname, 'ptau', 'powersoftau_09.ptau')
    });
    await use(compiler);
    await compiler.clean();
  }
});

describe('compile cmd', () => {
  const someCircuitCode = dedent`
    pragma circom 2.2.2;
    template Test() {
      input signal a;
      output signal b;
      b <== a + 1;
    }
    component main = Test();
  `;

  it('writes source code in disk', async ({ compiler }: Fixture) => {
    const source = dedent`
      pragma circom 2.2.2;
      template Test() {}
      component main = Test();
    `;

    const circuit = await compiler.compileStr(source);

    const read = await readFile(circuit.mainFilePath);
    expect(read.toString().trim()).toEqual(source.trim());
  });

  it('generates sym file', async ({ compiler }: Fixture) => {
    const source = dedent`
      pragma circom 2.2.2;
      template Test() {
        input signal a;
        output signal b;
        b <== a + 1;
      }
      component main = Test();
    `;

    const circuit = await compiler.compileStr(source);
    const symContent = await circuit.symFile();

    const expectedContent = ['1,1,0,main.b', '2,2,0,main.a'].join('\n');

    expect(symContent.trim()).toEqual(expectedContent.trim());
  });

  it('produces right r1cs file', async ({ compiler }: Fixture) => {
    const source = dedent`
      pragma circom 2.2.2;
      template Test() {
        input signal a;
        output signal b;
        b <== a + 1;
      }
      component main = Test();
    `;

    const circuit = await compiler.compileStr(source);
    const path = circuit.r1csPath();

    await expect(r1cs.info(path)).resolves.not.toThrow();
  });

  it('can store input in disk', async ({ compiler }: Fixture) => {
    const source = dedent`
      pragma circom 2.2.2;
      template Test() {
        input signal a;
        output signal b;
        b <== a + 1;
      }
      component main = Test();
    `;

    const circuit = await compiler.compileStr(source);
    const input = { a: '11' };
    await circuit.setInput(input);
    const path = circuit.inputPath(input);

    const file = await readFile(path);
    expect(JSON.parse(file.toString())).toEqual({ a: '11' });
  });

  it('generates witness with proper input', async ({ compiler }: Fixture) => {
    const source = dedent`
      pragma circom 2.2.2;
      template Test() {
        input signal a;
        output signal b;
        b <== a + 1;
      }
      component main = Test();
    `;

    const circuit = await compiler.compileStr(source);
    const inputs = { a: '11' };
    const witness = await circuit.witness(inputs);

    const file = await readFile(witness.filePath);
    expect(file.toString()).toMatch(/^wtns/);
    const check = await wtns.check(circuit.r1csPath(), circuit.witnessPath(inputs));
    expect(check).toBe(true);
  });

  it('can generate proofs', async ({ compiler }: Fixture) => {
    const circuit = await compiler.compileStr(someCircuitCode);
    const witness = await circuit.witness({ a: '11' });
    const proof = await witness.proveGroth16();
    expect(proof.publicSignals).toEqual(['12']);
    expect(proof.proof.curve).toEqual('bn128');
  });

  it('proofs can be verified', async ({ compiler }: Fixture) => {
    const circuit = await compiler.compileStr(someCircuitCode);
    const witness = await circuit.witness({ a: '11' });
    const proof = await witness.proveGroth16();

    const verification = await circuit.groth16Verify(proof);
    expect(verification).toBe(true);
  });

  it('can add library roots', async ({ compiler }: Fixture) => {
    const dir = join(import.meta.dirname, 'test-circuit-lib');
    compiler.addLibraryRoot(dir);

    const source = dedent`
      pragma circom 2.2.2;
      include "add.circom";
      template Test() {
        input signal a;
        input signal b;
        output signal c;
        c <== Add()(a, b);
      }
      component main = Test();
    `;

    const circuit = await compiler.compileStr(source);

    const w = await circuit.witness({ a: 10, b: 22 });
    const proof = await w.proveGroth16();
    expect(proof.publicSignals[0]).toEqual('32');
  });

  it('can receive library roots as config', async () => {
    const dir = join(import.meta.dirname, 'test-circuit-lib');

    const compiler = new CircomCompiler({
      libraryRoots: [dir]
    });

    const source = dedent`
      pragma circom 2.2.2;
      include "add.circom";
      template Test() {
        input signal a;
        input signal b;
        output signal c;
        c <== Add()(a, b);
      }
      component main = Test();
    `;
    await expect(compiler.compileStr(source)).resolves.not.toThrow();
  });

  it('can add library roots 2', async ({ compiler }: Fixture) => {
    const dir = join(import.meta.dirname);
    compiler.addLibraryRoot(dir);

    const source = dedent`
      pragma circom 2.2.2;
      include "test-circuit-lib/add.circom";
      template Test() {
        input signal a;
        input signal b;
        output signal c;
        c <== Add()(a, b);
      }
      component main = Test();
    `;

    const circuit = await compiler.compileStr(source);

    const w = await circuit.witness({ a: 10, b: 22 });
    const proof = await w.proveGroth16();
    expect(proof.publicSignals[0]).toEqual('32');
  });

  it('can add multiple library roots', async ({ compiler }: Fixture) => {
    const dir = join(import.meta.dirname, 'test-circuit-lib');
    const dir2 = join(import.meta.dirname, 'test-circuit-lib-2');
    compiler.addLibraryRoot(dir);
    compiler.addLibraryRoot(dir2);

    const source = dedent`
      pragma circom 2.2.2;
      include "add.circom";
      include "sub.circom";
      template Test() {
        input signal a;
        input signal b;
        signal c;
        output signal d;
        c <== Add()(a, b);
        d <== Sub()(c, 1);
      }
      component main = Test();
    `;

    const circuit = await compiler.compileStr(source);

    const w = await circuit.witness({ a: 10, b: 22 });
    const proof = await w.proveGroth16();
    expect(proof.publicSignals[0]).toEqual('31');
  });

  it('can save verification keys', async ({ compiler }: Fixture) => {
    const source = dedent`
      pragma circom 2.2.2;
      template Test() {
        output signal a <== 10;
      }
      component main = Test();
    `;
    const circuit = await compiler.compileStr(source);
    await circuit.saveVkey();
    const vKey = await circuit.vKey();

    const restored = JSON.parse((await readFile(circuit.vKeyPath())).toString());
    expect(restored).toEqual(vKey);
  });

  it('generates right extensions for all paths', async ({ compiler }: Fixture) => {
    const source = dedent`
      pragma circom 2.2.2;
      template Test() {
        output signal a <== 10;
      }
      component main = Test();
    `;
    const circuit = await compiler.compileStr(source);
    expect(circuit.vKeyPath()).toMatch(/\.vkey\.json$/);
    expect(circuit.zkeyInitialPath()).toMatch(/\.000\.zkey$/);
    expect(circuit.zkeyPath(10)).toMatch(/\.010\.zkey$/);
    expect(circuit.zkeyFinalPath()).toMatch(/\.final\.zkey$/);
    expect(circuit.witnessPath({ a: '1' })).toMatch(/\.wts$/);
    expect(circuit.inputPath({ a: '1' })).toMatch(/\.inputs\.json$/);
  });

  describe('compile errors', () => {
    it('raises appropiate error', async ({ compiler }: Fixture) => {
      const source = dedent`
        pragma circom 2.2.2;
        template Test() {
          output signal a <== 10 // <-- Missing ; at the end of the li
        }
        component main = Test();
      `;

      await expect(compiler.compileStr(source)).rejects.toSatisfy((e: CircomCompileError) => {
        expect(e).toBeInstanceOf(CircomCompileError);
        const mainCode = readFileSync(e.mainPath).toString();
        expect(mainCode).toEqual(source);
        expect(e.outputCode).toEqual(1);
        expect(e.message).toMatch(/Missing semicolon/);
        return true;
      });
    });
  });

  describe('runtime error', () => {
    it('raises appropiate error', async ({ compiler }: Fixture) => {
      const source = dedent`
        pragma circom 2.2.2;
        template Test() {
          input signal a;
          a === 11;
        }
        component main = Test();
      `;

      const circuit = await compiler.compileStr(source);
      await expect(circuit.witness({ a: '12' })).rejects.toSatisfy((e) => {
        expect(e).toBeInstanceOf(CircomRuntimeError);
        const typed = e as CircomRuntimeError;
        expect(typed.message).toMatch(/Error in template Test_0 line: 4/);
        expect(typed.inputSignals).toEqual({ a: '12' });
        expect(typed.wasmPath).toMatch(/\.wasm$/);
        return true;
      });
    });
  });

  describe('Circuit#fullProve', async () => {
    it('', async ({ compiler }: Fixture) => {
      const circuit = await compiler.compileStr(someCircuitCode);
      const proof = await circuit.fullProveGroth16({ a: '10' });
      expect(proof.publicSignals).toEqual(['11']);
    });
  });

  describe('#compileFile', async () => {
    it('can do full round with a valid circuit', async ({ compiler }) => {
      const file = temporaryFile({ extension: 'circom' });
      await writeFile(file, someCircuitCode);

      const circuit = await compiler.compileFile(file);
      const witness = await circuit.witness({ a: '1' });
      const proof = await witness.proveGroth16();
      const verification = await circuit.groth16Verify(proof);
      expect(verification).toBe(true);
    });
  });
});
