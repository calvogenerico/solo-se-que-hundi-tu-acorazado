import { describe, expect, it as baseIt } from "vitest";
import { CircomCompiler } from "@solose-ts/am-i-testing";
import * as path from "node:path";
import dedent from "dedent";
import { compile } from "../tooling/commands/compile.ts";


const it = baseIt.extend<{ compiler: CircomCompiler }>({
  compiler: async ({}, use) => {
    const compiler = new CircomCompiler({
      cwd: import.meta.dirname,
      ptauPath: 'fixture/powersoftau_09.ptau'
    });
    compiler.libraryRoot(path.join('..', 'circuits'));
    compiler.libraryRoot(path.join('..' , 'node_modules'));
    await use(compiler);
    await compiler.clean();
  }
})

describe('ZeroPad', () => {
  it('keeps the elements up to limit the same', async ({compiler}) => {
    const circuit = await compiler.compileStr(dedent`
      pragma circom 2.2.2;
      include "zero-pad.circom";
      template Test() {
        signal res1[3] <== ZeroPad(3)([1,1,1], 2);
        res1 === [1, 1, 0];

        signal res2[5] <== ZeroPad(5)([1,2,3,4,5], 3);
        res2[0] === 1;
        res2[1] === 2;
        res2[2] === 3;
      }
      component main = Test();
    `);

    await expect(circuit.fullProveGroth16({})).resolves.not.toThrow();
  });

  it('replace the elements after "len" with zeros', async ({ compiler }) => {
    const circuit = await compiler.compileStr(dedent`
      pragma circom 2.2.2;
      include "zero-pad.circom";
      template Test() {
        signal res1[3] <== ZeroPad(3)([1,1,1], 2);
        res1[2] === 0;

        signal res2[5] <== ZeroPad(5)([1,2,3,4,5], 3);
        res2[3] === 0;
        res2[4] === 0;
      }
      component main = Test();
    `);

    await expect(circuit.fullProveGroth16({})).resolves.not.toThrow();
  });

  it('when len is zero replaces all elements with zero', async ({ compiler }) => {
    const circuit = await compiler.compileStr(dedent`
      pragma circom 2.2.2;
      include "zero-pad.circom";
      template Test() {
        signal res1[3] <== ZeroPad(3)([1,2,3], 0);
        res1 === [0, 0, 0];
      }
      component main = Test();
    `);

    await expect(circuit.fullProveGroth16({})).resolves.not.toThrow();
  });

  it('when "len" is bigger than  max length for array array stays the same', async ({ compiler }) => {
    const circuit = await compiler.compileStr(dedent`
      pragma circom 2.2.2;
      include "zero-pad.circom";
      template Test() {
        signal res[3] <== ZeroPad(3)([1,2,3], 5);
        res === [1,2,3];
      }
      component main = Test();
    `);

    await expect(circuit.fullProveGroth16({})).resolves.not.toThrow();
  });

  it('when "len" is exactly the max length for the array, array gets unchanged', async ({ compiler }) => {
    const circuit = await compiler.compileStr(dedent`
      pragma circom 2.2.2;
      include "zero-pad.circom";
      template Test() {
        signal res[3] <== ZeroPad(3)([1,2,3], 3);
        res === [1,2,3];
      }
      component main = Test();
    `);

    await expect(circuit.fullProveGroth16({})).resolves.not.toThrow();
  });
});
