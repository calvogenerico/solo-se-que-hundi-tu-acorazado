import type { Circuit } from "./circuit.ts";
import { groth16 } from 'snarkjs';
import { Proof } from "./proof.ts";

export class Witness {
  filePath: string;
  private circuit: Circuit;

  constructor(filePath: string, circuit: Circuit) {
    this.filePath = filePath;
    this.circuit = circuit;
  }

  async proveGroth16(): Promise<Proof> {
    const { proof, publicSignals } = await groth16.prove(
      await this.circuit.generateGroth16Zkey(),
      this.filePath
    );

    return new Proof(publicSignals, proof, 'groth16');
  }
}
