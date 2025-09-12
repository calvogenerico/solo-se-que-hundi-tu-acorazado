pragma circom 2.2.2;

include "circomlib/circuits/comparators.circom";

template SomeComponent(Known1) {
    input signal in1;
    input signal in2;
    input signal in3;
    output signal out1;
    output signal out2;

    out1 <== in1 * in2;
    out2 <== in2 + in3;

    // out1 <== in1 * in2 * in3;
    // out2 <== (2 * in2) + (in2 * in3) + (in1 * in3);
}

template Test() {
    // //
    // // Exampe 1 vars
    // //

    // var aVariable = 10;

    // while (aVariable < 20) {
    //     aVariable +=1;
    // }

    // aVariable === 20;

    // if (aVariable == 20) {
    //     log("its 20!");
    // } else {
    //     log("What?");
    // }

    // // How may if there are in my code?

    // var otherVar = 0;
    // for (var i = 0; i <= aVariable; i++) {
    //     otherVar = otherVar + i;
    // }

    // otherVar === (1 + 20) * 10;


    // //
    // // Example 2: signals
    // // 

    // signal aSignal;
    // aSignal <== 10;
    // aSignal <== 20;

    // signal ifElseValue;
    // if (aSignal == 20) {
    //     ifElseValue <== 10;
    // } else {
    //     ifElseValue <== 11;
    // }

    // signal forValues[10];
    // for (var i = 0; i < aSignal; i++) {
    //     forValues[i] <== 10;
    // }

    // signal signal2;
    // 20 ==> signal2;

    // signal signal3;
    // signal3 <-- 100; // Que dificil...
    // // signal3 === 100
    // signal signal3Bis;
    // signal3Bis <== 100;

    // //
    // // Example 3: arrays
    // // 


    // signal array[3];
    // array[0] <== 10;
    // array[1] <== 20;
    // array[2] <== 30;

    // array === [10, 20, 30];

    //
    // Example 4: booleanos
    //

    // signal valor1 <== 1;
    // signal booleano1 <== valor1 == 1;
    // signal booleano2 <== IsEqual()([valor1, 1]);
    // log("booleano2: ", booleano2);

    // component equal1 = IsEqual();
    // equal1.in <== [valor1, 2];
    // log("equal1.out: ", equal1.out);

    // // https://github.com/iden3/circomlib/blob/master/circuits/comparators.circom#L37

    //
    // Example 5: Components
    //

    signal (a, b) <== SomeComponent(10)(1,2,3);

    // Listo. Ya dominan circom.
}


component main = Test();

