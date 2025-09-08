pragma circom 2.2.2;

include "../circuits/battle.circom";

template Test() {
    signal hit1 <== HitBoat(2, 2, 1)(0, 1, 0, 1);
    hit1 === 1;

    signal hit2 <== HitBoat(2, 2, 1)(0, 1, 0, 0);
    hit2 === 0;
}


component main = Test();

