import type { AddCmd } from "../cli.ts";
import { circuitOutDir } from "./compile.ts";
import { join } from "node:path";
import { zkeyFinishedFileName } from "./zkey-finish.ts";
import { exists } from "node:fs/promises";
import { $ } from "../utils.ts";

export function vkeyFileName(circuitPath: string): string {
    const base = circuitOutDir(circuitPath);
    return join(base, `vkey.json`);
}

async function vkeyGenerate(circuitPath: string) {
    const zkeyFile = zkeyFinishedFileName(circuitPath);
    const out = vkeyFileName(circuitPath);

    if (!await exists(zkeyFile)) {
        throw new Error('Missing finished zkey file. Maybe zkey-finish step is missing');
    }

    await $`bun snarkjs zkev ${zkeyFile} ${out}`
    console.log(`Verification key saved at ${out}`);
}

export const addVkeyGen: AddCmd = (cli) => cli.command(
    'vkey-gen [circuitPath]',
    'Generates verification key',
    (yargs) => yargs.positional('circuitPath', {
        type: 'string',
        default: 'circuits/main.circom',
        demandOption: false
    }),
    async (yargs) => {
        await vkeyGenerate(yargs.circuitPath)
    }
)