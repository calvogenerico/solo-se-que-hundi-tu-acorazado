pragma circom 2.2.2;

include "./common.circom";
include "circomlib/circuits/comparators.circom";


template ShipInBounds(hSize, vSize) {
    input Ship ship;

    // First check that the start position is inside boudns;
    signal firstXinsideSea <== LessThan(10)([ship.start.x, hSize]);
    firstXinsideSea === 1;
    signal firstYinsideSea <== LessThan(10)([ship.start.y, vSize]);
    firstYinsideSea === 1;

    // Second check if last position is present. For this both vertical and
    // horizontal are considered, and then the result is adjunsted based on isVertical.
    
    // Check last x
    signal lastHorizantailInBounds <== LessThan(10)([ship.start.x + ship.size, hSize]);
    signal lastHorizontalIfHorizontal <== lastHorizantailInBounds * (1 - ship.isVertical);

    // Check last y
    signal lastVericalInBounds <== LessThan(10)([ship.start.y + ship.size, vSize]);
    signal lastVerticalIfVertical <== lastVericalInBounds * ship.isVertical;

    // Beacuse at max one of those is going to be valid, the sum is compared with exactly 1.
    lastHorizontalIfHorizontal + lastVerticalIfVertical === 1;
}


template ValidateBoard(hSize, vSize) {
    assert(hSize > BIG_SHIP_SIZE());
    assert(vSize > BIG_SHIP_SIZE());

    input Ship smallShip;
    input Ship bigShip;

    smallShip.size === SMALL_SHIP_SIZE();
    bigShip.size === BIG_SHIP_SIZE();

    ShipInBounds(hSize, vSize)(smallShip);
    ShipInBounds(hSize, vSize)(bigShip);
}
