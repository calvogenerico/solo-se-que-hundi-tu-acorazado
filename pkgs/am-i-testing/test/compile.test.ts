import { describe, expect, it } from "vitest";
import { readFile } from 'node:fs/promises'
import { CircomCompiler } from "../src/circom-compiler.ts";


describe('compile cmd', () => {
  it('writes source code in disk', async () => {
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
  });

  it('generates sym file', async () => {
    const compiler = new CircomCompiler();
    const source = `
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

    const expectedContent = [
      '1,1,0,main.b',
      '2,2,0,main.a'
    ].join('\n');

    expect(symContent.trim()).toEqual(expectedContent.trim())
    await compiler.clean();
  });

})
