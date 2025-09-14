import type { AddCmd } from "../cli.ts";
import { compile } from "./compile.ts";
import { generateMainInputs } from "./generate-input.ts";
import { witness } from "./witness.ts";

async function runCircuit() {
  const circuitPath = 'circuits/main.circom';
  await compile(circuitPath);
  await generateMainInputs();
  await witness(circuitPath);
}

export const addRunCmd: AddCmd = (cli) => cli.command(
  'run',
  'compiles, generates inputs and witness for circuit',
  {},
  async () => runCircuit()
)
