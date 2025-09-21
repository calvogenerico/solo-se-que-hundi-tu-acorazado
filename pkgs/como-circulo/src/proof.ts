import type { Groth16Proof, PublicSignals } from "snarkjs";

type ProvingSystem = 'groth16' | 'plonk';

export class Proof {
  publicSignals: PublicSignals;
  proof: Groth16Proof;
  provingSystem: ProvingSystem

  constructor(publicSignals: PublicSignals, proof: Groth16Proof, provingSystem: ProvingSystem) {
    this.publicSignals = publicSignals;
    this.proof = proof;
    this.provingSystem = provingSystem;
  }
}
