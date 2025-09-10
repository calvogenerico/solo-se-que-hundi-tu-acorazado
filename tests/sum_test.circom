pragma circom 2.2.2;

include "../circuits/sum.circom";

template Test() {
    signal res1 <== Sum(3)([1,1,1], 2);
    res1 === 2;

    signal res2 <== Sum(5)([1,1,1, 0, 0], 5);
    res2 === 3;
}


component main = Test();

