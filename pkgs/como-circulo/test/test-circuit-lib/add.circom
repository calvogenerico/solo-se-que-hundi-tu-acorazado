pragma circom 2.2.2;

template Add() {
    input signal a;
    input signal b;

    output signal res;

    res <== a + b;
}
