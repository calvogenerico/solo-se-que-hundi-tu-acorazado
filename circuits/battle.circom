include "circomlib/circuits/comparators.circom";


template HitBoat(hSize, vSize, boatSize) {
    signal input shipStartX;
    signal input shipStartY;

    signal input hitX;
    signal input hitY;

    signal output wasHit;

    signal eq1 <== IsEqual()([shipStartX, hitX]);
    signal eq2 <== IsEqual()([shipStartY, hitY]);


    signal sum <== eq1 + eq2;
    wasHit <== IsEqual()([sum, 2]);
}