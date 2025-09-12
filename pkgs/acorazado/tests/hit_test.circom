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


    // Hit vertical boat on the position at the right of the start fails
    Ship() s4;
    s4.start <== p_0_0;
    s4.isVertical <== 1;
    s4.size <== 2;
    signal hit4 <== HitBoat(2, 2, 5)(s4, p_1_0);
    hit4 === 0;


    // Hit horizontal boat on the position at the right of the start
    Ship() s5;
    s5.start <== p_0_0;
    s5.isVertical <== 0;
    s5.size <== 2;
    signal hit5 <== HitBoat(2, 2, 5)(s5, p_1_0);
    hit5 === 1;

    // Hit horizontal boat on the position under the start fails
    Ship() s6;
    s6.start <== p_0_0;
    s6.isVertical <== 0;
    s6.size <== 2;
    signal hit6 <== HitBoat(2, 2, 5)(s6, p_0_1);
    hit6 === 0;


    // Hit above the start fails;
    Ship() s7;
    s7.start <== p_1_1;
    s7.isVertical <== 1;
    s7.size <== 2;
    signal hit7 <== HitBoat(5, 5, 2)(s7, p_1_0);
    hit7 === 0;

    // Hit left to the start fails;
    Ship() s8;
    s8.start <== p_1_1;
    s8.isVertical <== 0;
    s8.size <== 2;
    signal hit8 <== HitBoat(5, 5, 2)(s8, p_0_1);
    hit8 === 0;


    // Horizontal boat can be hit on any of their cells;
    Ship() s9;
    s9.start <== p_0_1;
    s9.isVertical <== 0;
    s9.size <== 2;
    signal hit9_1 <== HitBoat(5, 5, 2)(s9, p_0_1);
    hit9_1 === 1;
    signal hit9_2 <== HitBoat(5, 5, 2)(s9, p_1_1);
    hit9_2 === 1;

    // Vertical boat can be hit on any of their cells;
    Ship() s10;
    s10.start <== p_1_0;
    s10.isVertical <== 1;
    s10.size <== 2;
    signal hit10_1 <== HitBoat(5, 5, 2)(s10, p_1_0);
    hit10_1 === 1;
    signal hit10_2 <== HitBoat(5, 5, 2)(s10, p_1_1);
    hit10_2 === 1;
}


component main = Test();

