pragma circom 2.2.2;

include "./common.circom";
include "./sea.circom";
include "./hash-board.circom";
include "./battle.circom";

template TryToHit (
    hSize,
    vSize,
    MaxBoatSize
) {
    // At the moment we don't support boats bigger than 4;
    assert(MaxBoatSize == 4);

    // Data for first boat
    input signal smallShipStartX;
    input signal smallShipStartY;
    input signal smallShipIsVertical;
    input signal smallShipSize;

    // Data for second boat
    input signal bigShipStartX;
    input signal bigShipStartY;
    input signal bigShipIsVertical;
    input signal bigShipSize;

    // Verification data;
    input signal boardCommitment;

    // Hit;
    input signal hitX;
    input signal hitY;

    output signal out;


    // Initialize data
    Point() smallShipStart; 
    smallShipStart.x <== smallShipStartX;
    smallShipStart.y <== smallShipStartY;
    Ship() smallShip;
    smallShip.start <== smallShipStart;
    smallShip.isVertical <== smallShipIsVertical;
    smallShip.size <== smallShipSize;

    Point() bigShipStart; 
    bigShipStart.x <== bigShipStartX;
    bigShipStart.y <== bigShipStartY;
    Ship() bigShip;
    bigShip.start <== bigShipStart;
    bigShip.isVertical <== bigShipIsVertical;
    bigShip.size <== bigShipSize;

    Point() hit;
    hit.x <== hitX;
    hit.y <== hitY;

    // Validate board
    component validation = ValidateBoard(hSize, vSize);
    validation.smallShip <== smallShip;
    validation.bigShip <== bigShip;

    // Hash Ensure board is correct;
    signal recalculatedHash <== HashBoard()(smallShip, bigShip, hSize, vSize);
    recalculatedHash === boardCommitment;


    signal hitSmallBoat <== HitBoat(hSize, vSize, MaxBoatSize)(smallShip, hit);
    signal hitBigBoat <== HitBoat(hSize, vSize, MaxBoatSize)(bigShip, hit);

    out <== hitSmallBoat + hitBigBoat;
}

component main {public [boardCommitment, hitX, hitY]} = TryToHit(12, 12, 4);
