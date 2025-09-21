import { describe, expect, it } from "vitest";
import dedent from "dedent";

describe('ReplaceItems template', () => {
  it('replace all elements inside range', async () => {
    await expect(dedent`
      pragma circom 2.2.2;

      include "replace-items.circom";

      template Test() {
        signal res[5] <== ReplaceItems(5)([10, 0, 10, 11, 0], 4, 10, 100);
        res === [100, 0, 100, 11, 0];
      }

      component main = Test();
    `).toCircomExecOk();
  });

  it('replace elements out of range become zero', async () => {
    await expect(dedent`
      pragma circom 2.2.2;

      include "replace-items.circom";

      template Test() {
        signal res[5] <== ReplaceItems(5)([10, 10, 0, 0, 0], 2, 10, 100);
        res === [100, 100, 0, 0, 0];
      }

      component main = Test();
    `).toCircomExecOk();
  });

  it('when no element matches the array does not change', async () => {
    await expect(dedent`
      pragma circom 2.2.2;

      include "replace-items.circom";

      template Test() {
        signal res[5] <== ReplaceItems(5)([10, 10, 1, 1, 10], 5, 11, 100);
        res === [10, 10, 1, 1, 10];
      }

      component main = Test();
    `).toCircomExecOk();
  });

  it('when size is zero array becomes all zeros', async () => {
    await expect(dedent`
      pragma circom 2.2.2;

      include "replace-items.circom";

      template Test() {
        signal res[5] <== ReplaceItems(5)([10, 10, 10, 10, 10], 0, 10, 100);
        res === [0, 0, 0, 0, 0];
      }

      component main = Test();
    `).toCircomExecOk();
  });

  it('when elements that match with "to" value are not reverted', async () => {
    await expect(dedent`
      pragma circom 2.2.2;

      include "replace-items.circom";

      template Test() {
        signal res[5] <== ReplaceItems(5)([100, 10, 3, 0, 0], 3, 10, 100);
        res === [100, 100, 3, 0, 0];
      }

      component main = Test();
    `).toCircomExecOk();
  });
})
