import type { AddCmd } from "../cli.ts";
import { $ } from "../utils.ts";
import { vkeyFileName } from "./vkey-generate.ts";
import { proofFilePath, publicArgsFilePath } from "./prove.ts";
import { existsSync } from "node:fs";

async function verify(circuitPath: string) {
  const vkey = vkeyFileName(circuitPath);
  const pubArgs = publicArgsFilePath(circuitPath);
  const proof = proofFilePath(circuitPath);

  if (!existsSync(vkey)) {
    throw new Error(`vkey file not found at ${vkey}. Maybe verification key step is missing?`);
  }
  if (!existsSync(pubArgs)) {
    throw new Error(`Public inputs file not found at ${pubArgs}. Maybe proof step is missing?`);
  }

  if (!existsSync(proof)) {
    throw new Error(`proof file not found at ${proof}. Maybe proof step is missing?`);
  }

  await $`pnpm snarkjs g16v ${vkey} ${pubArgs} ${proof}`
}

export const addVerify: AddCmd = (cli) => cli.command(
  'verify [circuitPath]',
  'generates a proof',
  (yargs) => yargs.positional('circuitPath', {
    type: 'string',
    default: 'circuits/main.circom',
    demandOption: false
  }),
  async (yargs) => {
    verify(yargs.circuitPath);
  }
)
