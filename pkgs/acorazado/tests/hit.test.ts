import { describe, expect, it } from "vitest";
import dedent from "dedent";

describe('HitBoat template', () => {
  const circuitSource = dedent`
    pragma circom 2.2.2;

    include "battle.circom";
    include "common.circom";

    template Test {
      input Ship() ship;
      input Point() hit;
      input signal expectedHit;
      signal wasHit <== HitBoat(5, 5, 3)(ship, hit);
      wasHit === expectedHit;
    }

    component main = Test();
  `;

  type PointData = { x: number, y: number }
  type ShipData = {
    start: PointData,
    isVertical: number,
    size: number
  }

  function shipSignals(ship: ShipData) {
    return [
      ship.start.x.toString(),
      ship.start.y.toString(),
      ship.isVertical.toString(),
      ship.size.toString(),
    ]
  }

  function pointSignals(point: PointData) {
    return [point.x.toString(), point.y.toString()]
  }

  it('does not hit when aims diagonal to start', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 1, size: 1}),
        hit: pointSignals({x: 2, y: 2}),
        expectedHit: '0'
      }
    }).toCircomExecOkWithSignals()
  });

  it('hits when targets exactly the start of the ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 2, y: 3}, isVertical: 1, size: 2}),
        hit: pointSignals({x: 2, y: 3}),
        expectedHit: '1'
      }
    }).toCircomExecOkWithSignals()
  });

  it('hits when targets exactly position under start for vertical ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 1, size: 3}),
        hit: pointSignals({x: 1, y: 2}),
        expectedHit: '1'
      }
    }).toCircomExecOkWithSignals()
  });


  it('hits when targets exactly last position for vertical ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 1, size: 3}),
        hit: pointSignals({x: 1, y: 3}),
        expectedHit: '1'
      }
    }).toCircomExecOkWithSignals()
  });

  it('does not hit when aims under vertical ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 1, size: 3}),
        hit: pointSignals({x: 1, y: 4}),
        expectedHit: '0'
      }
    }).toCircomExecOkWithSignals()
  });

  it('does not hit when aims on top of vertical ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 1, size: 3}),
        hit: pointSignals({x: 1, y: 0}),
        expectedHit: '0'
      }
    }).toCircomExecOkWithSignals()
  });

  it('hits when aims to start of horizontal ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 0, size: 3}),
        hit: pointSignals({x: 1, y: 1}),
        expectedHit: '1'
      }
    }).toCircomExecOkWithSignals()
  });

  it('hits when aims to middle of horizontal ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 0, size: 3}),
        hit: pointSignals({x: 2, y: 1}),
        expectedHit: '1'
      }
    }).toCircomExecOkWithSignals()
  });

  it('hits when aims to end of horizontal ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 0, size: 3}),
        hit: pointSignals({x: 3, y: 1}),
        expectedHit: '1'
      }
    }).toCircomExecOkWithSignals()
  });

  it('does not hit when aims at the right of horizontal ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 0, size: 3}),
        hit: pointSignals({x: 4, y: 1}),
        expectedHit: '0'
      }
    }).toCircomExecOkWithSignals()
  });

  it('does not hit when aims at the left of horizontal ship', async () => {
    await expect({
      source: circuitSource,
      signals: {
        ship: shipSignals({start: {x: 1, y: 1}, isVertical: 0, size: 3}),
        hit: pointSignals({x: 0, y: 1}),
        expectedHit: '0'
      }
    }).toCircomExecOkWithSignals()
  });
});
