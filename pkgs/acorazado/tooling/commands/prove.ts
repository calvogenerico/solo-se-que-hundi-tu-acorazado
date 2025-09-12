import type { AddCmd } from "../cli.ts";
import { circuitOutDir } from "./compile.ts";
import { join } from "node:path";
import { $ } from "../utils.ts";
import { zkeyFinishedFileName } from "./zkey-finish.ts";
import { witnessFilePath } from "./witness.ts";
import { exists } from "node:fs/promises";

export function proofFilePath(circuitPath: string): string {
    const dir = circuitOutDir(circuitPath);
    return join(dir, 'out.proof');
}

export function publicArgsFilePath(circuitPath: string): string {
    const dir = circuitOutDir(circuitPath);
    return join(dir, 'out-public.json');
}

export async function proveCircuit(circuitPath: string) {
    const zkey = zkeyFinishedFileName(circuitPath);
    const witness = witnessFilePath(circuitPath);

    if (!await exists(zkey)) {
        throw new Error(`Zkey file not found at ${zkey}. Maybe finish zkey cmd is missing?`);
    }

    if (!await exists(witness)) {
        throw new Error(`Witness file not found at ${witness}. Maybe run command is missing?`)
    }

    const outProof = proofFilePath(circuitPath);
    const outPublicArgs = publicArgsFilePath(circuitPath);
    await $`bun snarkjs g16p ${zkey} ${witness} ${outProof} ${outPublicArgs}`
    console.log('\nSuccess! Proof generated.');
    console.log(`proof: ${outProof}`);
    console.log(`pub  : ${outPublicArgs}`);
}

export const addProve: AddCmd = (cli) => cli.command(
    'prove [circuitPath]',
    'generates a proof',
    (yargs) => yargs.positional('circuitPath', {
        type: 'string',
        default: 'circuits/main.circom',
        demandOption: false
    }),
    async (yargs) => {
        proveCircuit(yargs.circuitPath);
    }
)