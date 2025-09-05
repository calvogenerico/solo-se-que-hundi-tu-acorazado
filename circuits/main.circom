pragma circom 2.2.2;

template Batalla () {
    signal input a;
    signal input b;
    signal output c;

    c <== a + b;
}

component main {public [a]} = Batalla();
