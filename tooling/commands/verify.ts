import type { AddCmd } from "../cli.ts";
import { $ } from "../utils.ts";
import { vkeyFileName } from "./vkey-generate.ts";
import { proofFilePath, publicArgsFilePath } from "./prove.ts";
import { exists } from "node:fs/promises";

async function verify(circuitPath: string) {
    const vkey = vkeyFileName(circuitPath);
    const pubArgs = publicArgsFilePath(circuitPath);
    const proof = proofFilePath(circuitPath);

    if (!await exists(vkey)) {
        throw new Error(`vkey file not found at ${vkey}. Maybe verification key step is missing?`);
    }
    if (!await exists(pubArgs)) {
        throw new Error(`Public inputs file not found at ${pubArgs}. Maybe proof step is missing?`);
    }

    if (!await exists(proof)) {
        throw new Error(`proof file not found at ${proof}. Maybe proof step is missing?`);
    }

    `verification_key.json] [public.json] [proof.json]`
    await $`bun snarkjs g16v ${vkey} ${pubArgs} ${proof}`
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
