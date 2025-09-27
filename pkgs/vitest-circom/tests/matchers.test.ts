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
    it('returns empty results for a circuit with no outputs', () => {
      expect(dedent`
        pragma circom 2.2.2;
        template Test() {}
        component main = Test();
      `).toCircomExecAndOutputs([]);
    });

    it('returns outputs of the circuit', () => {
      expect(dedent`
        pragma circom 2.2.2;
        template Test() {
          output signal a = 1;
          output signal b = 123;
        }
        component main = Test();
      `).toCircomExecAndOutputs(['1', '123']);
    });

    it('returns list of public inputs when no outputs', () => {
      expect({
        source: dedent`
          pragma circom 2.2.2;
          template Test() {
            input signal input1;
            input signal input2;
          }
          component main{public [input1]} = Test();
        `,
        signals: ['200', '201']
      }).toCircomExecAndOutputs(['200']);
    });
  });
});
