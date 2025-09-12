pragma circom 2.2.2;

include "circomlib/circuits/comparators.circom";
include "./sum.circom";
include "./zero-pad.circom";
include "./common.circom";
                                                                                                                 
template HitBoat(hSize, vSize, MaxBoatSize) {
    input Ship ship;

    input Point hit;

    signal output wasHit;

    component checkLen = LessEqThan(10);
    checkLen.in <== [ship.size, MaxBoatSize];
    checkLen.out === 1;

    signal xValues[MaxBoatSize];
    signal yValues[MaxBoatSize];
    Point boatPositions[MaxBoatSize];

    for (var i = 0; i < MaxBoatSize; i++) {
        xValues[i] <== ship.start.x + (1 - ship.isVertical) * i;
        yValues[i] <== ship.start.y + ship.isVertical * i;
        boatPositions[i].x <== xValues[i];
        boatPositions[i].y <== yValues[i];
    }

    signal eqX[MaxBoatSize];
    signal eqY[MaxBoatSize];
    signal hits[MaxBoatSize];

    for (var i = 0; i < MaxBoatSize; i++) {
        eqX[i] <== IsEqual()([boatPositions[i].x, hit.x]);
        eqY[i] <== IsEqual()([boatPositions[i].y, hit.y]);
        hits[i] <== IsEqual()([eqX[i] + eqY[i], 2]);
    }

    signal realHits[MaxBoatSize] <== ZeroPad(MaxBoatSize)(hits, ship.size);
    signal totalSum <== Sum(MaxBoatSize)(realHits, ship.size);

    component isZero = IsZero();

    isZero.in <== totalSum;
    wasHit <== 1 - isZero.out;
}