pragma circom 2.2.2;

include "../circuits/battle.circom";

template Test() {
    Point() p_0_0;
    p_0_0.x <== 0;
    p_0_0.y <== 0;

    Point() p_0_1;
    p_0_1.x <== 0;
    p_0_1.y <== 1;

    Point() p_1_0;
    p_1_0.x <== 1;
    p_1_0.y <== 0;

    Point() p_1_1;
    p_1_1.x <== 1;
    p_1_1.y <== 1;


    // Hit when hitting ship start
    Ship() s1;
    s1.start <== p_0_0;
    s1.isVertical <== 1;
    s1.size <== 1;
    signal hit1 <== HitBoat(2, 2, 1)(s1, p_0_0);
    hit1 === 1;


    // No hit
    Ship() s2;
    s2.start <== p_0_0;
    s2.isVertical <== 1;
    s2.size <== 1;
    signal hit2 <== HitBoat(2, 2, 1)(s2, p_1_1);
    hit2 === 0;


    // Hit vertical boat on the position under the start
    Ship() s3;
    s3.start <== p_0_0;
    s3.isVertical <== 1;
    s3.size <== 2;
    signal hit3 <== HitBoat(2, 2, 5)(s3, p_0_1);
    hit3 === 1;

    // Point p2 <== Point()(0, 0);
    // Boat b2 <== Boat()(p2, 1, 2);
    // signal hit2 <== HitBoat(2, 2, 1)(b2, 0, 1);
    // hit2 === 1;

    // signal hit2 <== HitBoat(2, 2, 1)(0, 1, 0, 0);
    // hit2 === 0;
}


component main = Test();

