pragma circom 2.2.2;

bus Point() {
    signal x;
    signal y;
}

bus Ship() {
    Point() start;
    signal isVertical;
    signal size;
}

function SMALL_SHIP_SIZE() {
    return 2;
}

function BIG_SHIP_SIZE() {
    return 4;
}