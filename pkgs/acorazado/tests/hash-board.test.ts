import { describe, expect, it } from "vitest";
import dedent from "dedent";

describe('HashBoard template', () => {
  it('produces right hash', async () => {
    const source = dedent`
    pragma circom 2.2.2;

    include "hash-board.circom";
    include "common.circom";

    template Test() {
      Point() startShip1;
      startShip1.x <== 3;
      startShip1.y <== 3;

      Point() startShip2;
      startShip2.x <== 5;
      startShip2.y <== 5;

      Ship() ship1;
      ship1.start <== startShip1;
      ship1.isVertical <== 1;
      ship1.size <== 2;

      Ship() ship2;
      ship2.start <== startShip2;
      ship2.isVertical <== 0;
      ship2.size <== 4;


      signal out <== HashBoard()(ship1, ship2, 12, 12);
      out === 19851601164978595064910600514356114892428070917792260872497043985742628256314;
    }

    component main = Test();
    `;

    await expect(source).toCircomExecOk();
  });
});
