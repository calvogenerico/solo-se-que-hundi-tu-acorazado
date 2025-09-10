pragma circom 2.2.2;

include "circomlib/circuits/comparators.circom";

template ZeroPad(MaxLength) {
    input signal arr[MaxLength];
    input signal len;

    output signal out[MaxLength];

    signal inBounds[MaxLength];

    for (var i = 0; i < MaxLength; i++) {
        inBounds[i] <== LessThan(10)([i, len]);
        out[i] <== inBounds[i] * arr[i];
    }
}