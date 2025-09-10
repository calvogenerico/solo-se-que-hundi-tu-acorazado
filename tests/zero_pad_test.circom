pragma circom 2.2.2;

include "../circuits/zero-pad.circom";

template Test() {
    signal res1[3] <== ZeroPad(3)([1,1,1], 2);
    res1 === [1, 1, 0];

    signal res2[3] <== ZeroPad(3)([1,1,1], 0);
    res2 === [0, 0, 0];

    signal res3[3] <== ZeroPad(3)([1,1,1], 3);
    res3 === [1, 1, 1];
}


component main = Test();

