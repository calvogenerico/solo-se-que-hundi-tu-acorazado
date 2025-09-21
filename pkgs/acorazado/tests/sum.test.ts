import { describe, expect, it } from "vitest";
import dedent from "dedent";

describe('Sum circuit', () => {
  it('returns zero when all elements are zero', async () => {
    await expect(dedent`
      pragma circom 2.2.2;
      include "sum.circom";

      template Test() {
        signal res1 <== Sum(1)([0], 1);
        res1 === 0;

        signal res2 <== Sum(2)([0, 0], 2);
        res2 === 0;

        signal res3 <== Sum(5)([0, 0, 0, 0, 0], 4);
        res3 === 0;
      }
      component main = Test();
    `).toCircomExecOk();
  });


  it('produces right values for sums', async () => {
    const expected1 = [1, 2, 3].reduce((a, b) => a + b).toString();
    const expected2 = [123, 456, 789].reduce((a, b) => a + b).toString();
    const expected3 = [1000, 0, 1, 0, 333, 44444].reduce((a, b) => a + b).toString();

    await expect({
      source: dedent`
        pragma circom 2.2.2;
        include "sum.circom";
        template Test() {
          input signal expected1;
          input signal expected2;
          input signal expected3;

          signal res1 <== Sum(3)([1,2,3], 3);
          res1 === expected1;

          signal res2 <== Sum(3)([123, 456, 789], 3);
          res2 === expected2;

          signal res3 <== Sum(6)([1000, 0, 1, 0, 333, 44444], 6);
          res3 === expected3;
        }
        component main = Test();
      `,
      signals: {
        expected1,
        expected2,
        expected3
      }
    }).toCircomExecOkWithSignals();
  });

  it('produces right values for sums (2)', async () => {
    await expect(dedent`
      pragma circom 2.2.2;
      include "sum.circom";
      template Test() {
        output signal out;
        out <== Sum(3)([1, 2,3], 3);
      }
      component main = Test();
    `).toCircomExecAndOutputs(['6']);
  });
})
