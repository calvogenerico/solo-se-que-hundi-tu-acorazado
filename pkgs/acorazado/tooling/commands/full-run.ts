import type { AddCmd } from "../cli.ts";
import { circuitOutDir, compile } from "./compile.ts";
import { generateMainInputs } from "./generate-input.ts";
import { witness } from "./witness.ts";
import { zkeyGen } from "./zkey-generate.ts";
import { zkeyContrib } from "./zkey-contribute.ts";
import { zkeyFinish } from "./zkey-finish.ts";
import { proveCircuit } from "./prove.ts";


async function fullRunCircuit() {
  const circuitPath = 'circuits/main.circom';
  await compile(circuitPath);
  await generateMainInputs();
  await witness(circuitPath);
  await zkeyGen(circuitPath);
  await zkeyContrib(circuitPath);
  await zkeyFinish(circuitPath);
  await proveCircuit(circuitPath);
}

export const addFullRunCmd: AddCmd = (cli) => cli.command(
  'full-run',
  'compiles, generates inputs, zkeys, witness and proof for circuit',
  {},
  async () => fullRunCircuit()
)
