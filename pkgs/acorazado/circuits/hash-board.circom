pragma circom 2.2.2;

include "./common.circom";
include "circomlib/circuits/poseidon.circom";

template HashShip() {
    input Ship ship;
    output signal out;

    Poseidon(4)([ship.start.x, ship.start.y, ship.isVertical, ship.size]) ==> out;
}

template HashBoard() {
    input Ship ship1;
    input Ship ship2;

    input signal hSize;
    input signal vSize;

    output signal out;

    signal hashShip1 <== HashShip()(ship1);
    signal hashShip2 <== HashShip()(ship2);


    Poseidon(4)([hashShip1, hashShip2, hSize, vSize]) ==> out;
}