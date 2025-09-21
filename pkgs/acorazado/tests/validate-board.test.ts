import { describe, expect, it } from "vitest";
import dedent from "dedent";

describe('ValidateBoard', () => {
  it('fails to compile if board is smaller than ships horizontally', async () => {
    const source = dedent`
      pragma circom 2.2.2;
      include "sea.circom";
      include "common.circom";

      template Test {
        Point() p1;
        p1.x <== 0;
        p1.y <== 0;

        Point() p2;
        p2.x <== 1;
        p2.y <== 1;

        Ship ship1;
        ship1.start <== p1;
        ship1.isVertical <== 1;
        ship1.size <== SMALL_SHIP_SIZE();
        Ship ship2;
        ship2.start <== p2;
        ship2.isVertical <== 0;
        ship2.size <== BIG_SHIP_SIZE();

        ValidateBoard(BIG_SHIP_SIZE() - 1, 10)(ship1, ship2);
      }

      component main = Test();
    `;

    await expect(source).toCircomCompileError();
  });

  it('fails to compile if board is smaller than ships horizontally with corrent message', async () => {
    const source = dedent`
      pragma circom 2.2.2;
      include "sea.circom";
      include "common.circom";

      template Test {
        Point() p1;
        p1.x <== 0;
        p1.y <== 0;

        Point() p2;
        p2.x <== 1;
        p2.y <== 1;

        Ship ship1;
        ship1.start <== p1;
        ship1.isVertical <== 1;
        ship1.size <== SMALL_SHIP_SIZE();
        Ship ship2;
        ship2.start <== p2;
        ship2.isVertical <== 0;
        ship2.size <== BIG_SHIP_SIZE();

        ValidateBoard(BIG_SHIP_SIZE() - 1, 10)(ship1, ship2);
      }

      component main = Test();
    `;

    await expect(source).toCircomCompileErrorThat(e => {
      expect(e.message).toMatch(/assert\(hSize > BIG_SHIP_SIZE\(\)\)/);
    });
  });

  it('fails to compile if board is smaller than ships vertically', async () => {
    const source = dedent`
      pragma circom 2.2.2;
      include "sea.circom";
      include "common.circom";

      template Test {
        Point() p1;
        p1.x <== 0;
        p1.y <== 0;

        Point() p2;
        p2.x <== 1;
        p2.y <== 1;

        Ship ship1;
        ship1.start <== p1;
        ship1.isVertical <== 1;
        ship1.size <== SMALL_SHIP_SIZE();
        Ship ship2;
        ship2.start <== p2;
        ship2.isVertical <== 0;
        ship2.size <== BIG_SHIP_SIZE();

        ValidateBoard(10, BIG_SHIP_SIZE() - 1)(ship1, ship2);
      }

      component main = Test();
    `;

    await expect(source).toCircomCompileError();
  });

  it('fails to compile if board is smaller than ships vertically with proper message', async () => {
    const source = dedent`
      pragma circom 2.2.2;
      include "sea.circom";
      include "common.circom";

      template Test {
        Point() p1;
        p1.x <== 0;
        p1.y <== 0;

        Point() p2;
        p2.x <== 1;
        p2.y <== 1;

        Ship ship1;
        ship1.start <== p1;
        ship1.isVertical <== 1;
        ship1.size <== SMALL_SHIP_SIZE();
        Ship ship2;
        ship2.start <== p2;
        ship2.isVertical <== 0;
        ship2.size <== BIG_SHIP_SIZE();

        ValidateBoard(10, BIG_SHIP_SIZE() - 1)(ship1, ship2);
      }

      component main = Test();
    `;

    await expect(source).toCircomCompileErrorThat(e => {
      expect(e.message).toContain('assert(vSize > BIG_SHIP_SIZE())')
    });
  });
});
