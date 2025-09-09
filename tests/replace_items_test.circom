pragma circom 2.2.2;

include "../circuits/replace-items.circom";

template Test() {
    signal res1[3] <== ReplaceItems(3)([10, 0, 0], 2, 10, 100);
    res1 === [100, 0, 0];

    signal res2[3] <== ReplaceItems(3)([10, 0, 0], 0, 10, 100);
    res2 === [0, 0, 0];

    signal res3[3] <== ReplaceItems(3)([10, 0, 1], 1, 10, 100);
    res3 === [100, 0, 0];

    signal res4[4];
    component replace1 = ReplaceItems(4);
    replace1.array <== [1, 1, 1, 0];
    replace1.len <== 3;
    replace1.from <== 1;
    replace1.to <== 10;

    replace1.out ==> res4;
    res4 === [10, 10, 10, 0];
}


component main = Test();
