import { describe, expect, it } from "vitest";
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

  });
});
