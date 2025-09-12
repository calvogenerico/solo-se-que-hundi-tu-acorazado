pragma circom 2.2.2;

include "circomlib/circuits/comparators.circom";

template Sum(MaxLength) {
    input signal arr[MaxLength];
    input signal len;
    output signal out;

    signal sums[MaxLength];

    sums[0] <== arr[0];

    for (var i = 1; i < MaxLength; i++) {
        sums[i] <==  sums[i - 1] + arr[i];
    }

    signal partials[MaxLength][3];
    signal inBounds[MaxLength];

    partials[0] <== [0, 0, sums[0]];
    inBounds[0] <== 1;

    for (var i = 1; i < MaxLength; i++) {
        inBounds[i] <== LessThan(10)([i, len]);
        partials[i][0] <== inBounds[i] * sums[i];
        partials[i][1] <== (1 - inBounds[i]) * partials[i - 1][2];
        partials[i][2] <== partials[i][0] + partials[i][1];
    }

    out <== partials[MaxLength - 1][2];
}