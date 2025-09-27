import { describe, expect, it } from 'vitest';
import dedent from 'dedent';

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

    await expect(source).toCircomCompileErrorThat((e) => {
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

    await expect(source).toCircomCompileErrorThat((e) => {
      expect(e.message).toContain('assert(vSize > BIG_SHIP_SIZE())');
    });
  });

  it('fails if first ship is not the right size', async () => {
    const source = dedent`
      pragma circom 2.2.2;

      include "sea.circom";
      include "common.circom";

      template Test() {
          // Error out when ship1 is not the right size

          Point() p1;
          p1.x <== 0;
          p1.y <== 0;

          Point() p2;
          p2.x <== 1;
          p2.y <== 1;

          Ship ship1;
          ship1.start <== p1;
          ship1.isVertical <== 1;
          ship1.size <== SMALL_SHIP_SIZE() + 1;
          Ship ship2;
          ship2.start <== p2;
          ship2.isVertical <== 0;
          ship2.size <== BIG_SHIP_SIZE();

          ValidateBoard(10, 10)(ship1, ship2);
      }


      component main = Test();
    `;

    await expect(source).toCircomExecWithError();
  });

  it('fails if first ship is not the right size (2)', async () => {
    const source = dedent`
      pragma circom 2.2.2;

      include "sea.circom";
      include "common.circom";

      template Test() {
          // Error out when ship1 is not the right size

          Point() p1;
          p1.x <== 0;
          p1.y <== 0;

          Point() p2;
          p2.x <== 1;
          p2.y <== 1;

          Ship ship1;
          ship1.start <== p1;
          ship1.isVertical <== 1;
          ship1.size <== SMALL_SHIP_SIZE() + 1;
          Ship ship2;
          ship2.start <== p2;
          ship2.isVertical <== 0;
          ship2.size <== BIG_SHIP_SIZE();

          ValidateBoard(10, 10)(ship1, ship2);
      }


      component main = Test();
    `;

    await expect(source).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  it('fails if first ship 2 is not the right size (2)', async () => {
    const source = dedent`
      pragma circom 2.2.2;

      include "sea.circom";
      include "common.circom";

      template Test() {
          // Error out when ship2 is not the right size

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
          ship2.size <== BIG_SHIP_SIZE() + 1;
          ValidateBoard(10, 10)(ship1, ship2);
      }

      component main = Test();
    `;

    await expect(source).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  it('fails if ship1 is positioned out of bounds in x', async () => {
    const source = dedent`
      pragma circom 2.2.2;

      include "sea.circom";
      include "common.circom";

      template Test() {
        // Error out when ship1 positioned out of bounds in x;

        Point() p1;
        p1.x <== 11; // out of bounds in x
        p1.y <== 5;

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

        ValidateBoard(10, 10)(ship1, ship2);
      }

      component main = Test();
    `;

    await expect(source).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  const sourceCode = dedent`
    pragma circom 2.2.2;

    include "sea.circom";
    include "common.circom";

    template Test() {
      // Error out when ship2 positioned out of bounds in x;

      input Ship() ship1;
      input Ship() ship2;

      ValidateBoard(10, 10)(ship1, ship2);
    }

    component main = Test();
  `;

  it('fails if ship2 start is positioned out of bounds in x', async () => {
    const ship1 = [
      '5', // start.x
      '5', // start.y
      '1', // isVertical
      '2' // size
    ];

    const ship2 = [
      '11', // start.x <-- out of bounds
      '1', // start.y
      '1', // isVertical
      '4' // size
    ];

    const source = sourceCode;

    await expect({
      source,
      signals: {
        ship1,
        ship2
      }
    }).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  it('fails if ship2 start is positioned out of bounds in y', async () => {
    const ship1 = [
      '5', // start.x
      '5', // start.y
      '0', // isVertical
      '2' // size
    ];

    const ship2 = [
      '3', // start.x
      '11', // start.y <-- out of bounds
      '1', // isVertical
      '4' // size
    ];

    const source = sourceCode;

    await expect({
      source,
      signals: {
        ship1,
        ship2
      }
    }).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  it('fails when ship1 positioned with the tail out of bounds in x;', async () => {
    const ship1 = [
      '9', // start.x
      '5', // start.y
      '0', // isVertical
      '2' // size
    ];

    const ship2 = [
      '4', // start.x
      '4', // start.y
      '1', // isVertical
      '4' // size
    ];

    const source = sourceCode;

    await expect({
      source,
      signals: {
        ship1,
        ship2
      }
    }).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  it('fails when ship1 positioned with the tail out of bounds in y;', async () => {
    const ship1 = [
      '5', // start.x
      '9', // start.y
      '1', // isVertical
      '2' // size
    ];

    const ship2 = [
      '4', // start.x
      '4', // start.y
      '1', // isVertical
      '4' // size
    ];

    await expect({
      source: sourceCode,
      signals: {
        ship1,
        ship2
      }
    }).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  it('fails when ship2 positioned with the tail out of bounds in x', async () => {
    const ship1 = [
      '5', // start.x
      '5', // start.y
      '1', // isVertical
      '2' // size
    ];

    const ship2 = [
      '8', // start.x
      '4', // start.y
      '0', // isVertical
      '4' // size
    ];

    await expect({
      source: sourceCode,
      signals: {
        ship1,
        ship2
      }
    }).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  it('fails when ship2 positioned with the tail out of bounds in y', async () => {
    const ship1 = [
      '5', // start.x
      '5', // start.y
      '1', // isVertical
      '2' // size
    ];

    const ship2 = [
      '4', // start.x
      '8', // start.y
      '1', // isVertical
      '4' // size
    ];

    await expect({
      source: sourceCode,
      signals: {
        ship1,
        ship2
      }
    }).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  it('fails when ship1 vertical is not a bit', async () => {
    const ship1 = [
      '5', // start.x
      '5', // start.y
      '3', // isVertical <-- not a bit
      '2' // size
    ];

    const ship2 = [
      '4', // start.x
      '8', // start.y
      '1', // isVertical
      '4' // size
    ];

    await expect({
      source: sourceCode,
      signals: {
        ship1,
        ship2
      }
    }).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });

  it('fails when ship2 vertical is not a bit', async () => {
    const ship1 = [
      '5', // start.x
      '5', // start.y
      '0', // isVertical
      '2' // size
    ];

    const ship2 = [
      '4', // start.x
      '8', // start.y
      '123', // isVertical <-- not a bit
      '4' // size
    ];

    await expect({
      source: sourceCode,
      signals: {
        ship1,
        ship2
      }
    }).toCircomExecWithErrorThat((e) => {
      expect(e.message).toMatch(/Assert Failed/);
      expect(e.message).toMatch(/ValidateBoard/);
    });
  });
});
