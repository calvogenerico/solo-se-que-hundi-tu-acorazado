pragma circom 2.2.2;

include "../circuits/sea.circom";
include "../circuits/common.circom";

template Test() {
    // Error out when ship1 positioned out of bounds in x;

    Point() p1;
    p1.x <== 11;
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

