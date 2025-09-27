import { describe, expect, it } from "vitest";
import { CircomCompileError, CircomRuntimeError } from '@solose-ts/como-circulo';
import dedent from 'dedent';

describe('circom matchers', () => {
  describe('#toCircomExecOk', () => {
    it('can assert that a snippet execs ok', () => {
      expect(`
    pragma circom 2.2.2;
    template Test() {}
    component main = Test();
    `).toCircomExecOk();
    });

    it('works for real', () => {
      expect(`
    pragma circom 2.2.2;
    template Test() {}
    component main = Test();
    `).toCircomExecOk();
    });

    it('can assert that a snippet execs ok receiving the source code wrapped in an object', () => {
      expect({
        source: `
        pragma circom 2.2.2;
        template Test() {}
        component main = Test();
    `
      }).toCircomExecOk();
    });

    it('can receive an object with signals', () => {
      expect({
        source: `
        pragma circom 2.2.2;
        template Test() {}
        component main = Test();
    `,
        signals: {}
      }).toCircomExecOk();
    });

    it('uses signals received', () => {
      expect({
        source: `
        pragma circom 2.2.2;
        template Test() {
          input signal a;
          a === 5;
        }
        component main = Test();
    `,
        signals: {a: '5'}
      }).toCircomExecOk();
    });

    it('can send nested signals', async () => {
      await expect({
        source: dedent`
        pragma circom 2.2.2;
        bus Point() {
          signal x;
          signal y;
        }

        bus Boat {
          Point() position;
          signal color;
        }

        template Test() {
          input Boat() aBoat;
          input signal x;
          input signal y;
          input signal aColor;
          aBoat.color === aColor;
        }
        component main = Test();
    `,
        signals: {
          aBoat: [
            '1',
            '2',
            '3'
          ],
          x: '1',
          y: '2',
          aColor: '3'
        }
      }).toCircomExecOk();
    });
  });

  describe('#toCircomExecAndOutputs', () => {
    it('returns empty results for a circuit with no outputs', async () => {
      await expect(dedent`
        pragma circom 2.2.2;
        template Test() {}
        component main = Test();
      `).toCircomExecAndOutputs([]);
    });

    it('returns outputs of the circuit', async () => {
      await expect(dedent`
        pragma circom 2.2.2;
        template Test() {
          output signal a <== 1;
          output signal b <== 123;
        }
        component main = Test();
      `).toCircomExecAndOutputs(['1', '123']);
    });

    it('returns list of public inputs when no outputs', async () => {
      await expect({
        source: dedent`
          pragma circom 2.2.2;
          template Test() {
            input signal input1;
            input signal input2;
          }
          component main{public [input1]} = Test();
        `,
        signals: {
          input1: '200',
          input2: '201'
        }
      }).toCircomExecAndOutputs(['200']);
    });

    it('when outputs and public inputs it list first the outputs and then the public inputs', async () => {
      await expect({
        source: dedent`
          pragma circom 2.2.2;
          template Test() {
            input signal input1;
            input signal input2;
            input signal input3;

            output signal out1 <== 200;
            output signal out2 <== 201;
          }
          component main{public [input2, input3]} = Test();
        `,
        signals: {
          input1: '100',
          input2: '101',
          input3: '102',
        }
      }).toCircomExecAndOutputs(['200', '201', '101', '102']);
    });

    it('uses the public inputs order of declaration in the template', async () => {
      await expect({
        source: dedent`
          pragma circom 2.2.2;
          template Test() {
            input signal input1;
            input signal input2;
            input signal input3;
          }
          component main{public [input3, input2]} = Test();
        `,
        signals: {
          input1: '100',
          input2: '101',
          input3: '102',
        }
      }).toCircomExecAndOutputs(['101', '102']);
    });

    it('fails with right error if fails at compile time', async () => {
      try {
        await expect(dedent`
          pragma circom 2.2.2;
          template Test() {
            input signal input1 // missing semicolon
          }
          component main = Test();
        `).toCircomExecAndOutputs([]);
      } catch (e) {
        const erorr = e as Error;
        expect(erorr.message).toMatch(/^CompileError:/)
        return
      }
      expect.fail('Should have thrown');
    });

    it('fails with right error if fails at runtime', async () => {
      try {
        await expect(dedent`
          pragma circom 2.2.2;
          template Test() {
            1 === 2;
          }
          component main = Test();
        `).toCircomExecAndOutputs([]);
      } catch (e) {
        const erorr = e as Error;
        expect(erorr.message).toMatch(/^RuntimeError:/)
        return
      }
      expect.fail('Should have thrown');
    });
  });

  describe('#toCircomExecAndOutputThat', () => {
    it('Sends the error to generate assertions', async () => {
      await expect({
        source: dedent`
          pragma circom 2.2.2;
          template Test() {
            input signal a;
            signal output b <== 2;
          }
          component main{public [a]} = Test();
        `,
        signals: {
          a: '10'
        }
      }).toCircomExecAndOutputThat((signals) => {
        expect(signals).toEqual(['2', '10'])
      });
    });
  });

  describe('#toCircomCompileError', () => {
    it('fails when it does not throw', async () => {
      try {
        await expect(dedent`
          pragma circom 2.2.2;
          template Test() {
            1 === 1;
          }
          component main = Test();
        `).toCircomCompileError();
      } catch (e) {
        const erorr = e as Error;
        expect(erorr.message).toEqual('Expected to fail to compile, but compilation went ok');
        return
      }
      expect.fail('Should have thrown');
    });

    it('pass when circuit does not compile ok', async () => {
      await expect(
        dedent`
          pragma circom 2.2.2;
          template Test() {
            1 === 1 // Missing semicolon
          }
          component main = Test();
        `
      ).toCircomCompileError();
    });
  });

  describe('#toCircomCompileErrorThat', () => {
    it('When there is a compile error it sends the error to the block', async () => {
      await expect(dedent`
        pragma circom 2.2.2;
        template Test() {
          1 === 1 // Missign semicolon
        }
        component main = Test();
      `).toCircomCompileErrorThat(async (e) => {
        expect(e).toBeInstanceOf(CircomCompileError)
        expect(e.message).toMatch('Missing semicolon');
      });
    })
  });

  describe('#toCircomExecWithError', () => {
    it('passes when there is a runtime error', async () => {
      await expect(dedent`
        pragma circom 2.2.2;
        template Test() {
          1 === 2;
        }
        component main = Test();
      `).toCircomExecWithError();
    });

    it('fails when there is a compile error', async () => {
      let success = true;
      try {
        await expect(dedent`
          pragma circom 2.2.2;
          template Test() {
            1 === 2 // Missing semicolon
          }
          component main = Test();
        `).toCircomExecWithError();
        success = false;
      } catch (e) {
        expect((e as Error).message).toMatch(/^CompileError:/)
      }
      expect(success).toBe(true);
    });

    it('fails when there is no error', async () => {
      let success = true;
      try {
        await expect(dedent`
          pragma circom 2.2.2;
          template Test() {
            1 === 1;
          }
          component main = Test();
        `).toCircomExecWithError();
        success = false;
      } catch (e) {
        expect((e as Error).message).toEqual('Expected to fail to execute, but execution went ok')
      }
      expect(success).toBe(true);
    });
  });

  describe('#toCircomExecWithErrorThat', () => {
    it('passes when there is a runtime error', async () => {
      await expect(dedent`
        pragma circom 2.2.2;
        template Test() {
          1 === 2;
        }
        component main = Test();
      `).toCircomExecWithErrorThat((e) => {
        expect(e).toBeInstanceOf(CircomRuntimeError);
        expect(e.message).toMatch('Assert Failed. Error in template Test_0 line: 3');
      });
    });

    it('fails when there is a compile error', async () => {
      let success = true;
      try {
        await expect(dedent`
          pragma circom 2.2.2;
          template Test() {
            1 === 2 // Missing semicolon
          }
          component main = Test();
        `).toCircomExecWithErrorThat(() => {
          expect.fail('Should not execute')
        });
        success = false;
      } catch (e) {
        expect((e as Error).message).toMatch(/^CompileError:/)
      }
      expect(success).toBe(true);
    });

    it('fails when there is no error', async () => {
      let success = true;
      try {
        await expect(dedent`
          pragma circom 2.2.2;
          template Test() {
            1 === 1;
          }
          component main = Test();
        `).toCircomExecWithErrorThat(() => {
          expect.fail('Should not execute')
        });
        success = false;
      } catch (e) {
        expect((e as Error).message).toEqual('Expected to fail to execute, but execution went ok')
      }
      expect(success).toBe(true);
    });
  });
});
