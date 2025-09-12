pragma circom 2.2.2;

include "circomlib/circuits/comparators.circom";

template ReplaceItems(MaxLength) {
    input signal array[MaxLength];
    input signal len;
    input signal from;
    input signal to;

    output signal out[MaxLength];

    signal equals[MaxLength];
    signal firstTerms[MaxLength];
    signal secondTerms[MaxLength];
    signal aditions[MaxLength];

    for (var i = 0; i < MaxLength; i++) {
        equals[i] <== IsEqual()([array[i], from]);
        firstTerms[i] <== to * equals[i];
        secondTerms[i] <== array[i] * (1 - equals[i]);

        aditions[i] <== firstTerms[i] + secondTerms[i];
    }

    signal boundChecks[MaxLength];
    for (var i = 0; i < MaxLength; i++) {
        boundChecks[i] <== LessThan(10)([i, len]);
        out[i] <== aditions[i] * boundChecks[i];
    }
}