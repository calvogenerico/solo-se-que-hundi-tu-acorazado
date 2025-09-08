import { $ } from "bun";
import type { AddCmd } from "../cli";
import { circuitOutDir } from "./compile";
import { join, parse } from "node:path";
import { randomBytes } from "node:crypto";
import { lastZkeyFilePath } from "./zkey-contribute.ts";

export function zkeyFinishedFileName(circuitPath: string) {
    const base = circuitOutDir(circuitPath);
    const parsed = parse(circuitPath);
    return join(base, `${parsed.name}.last.zkey`)
}

async function zkeyFinish(circuitPath: string, givenEntropy?: string, contributorName?: string) {
    const input = await lastZkeyFilePath(circuitPath);
    const out = zkeyFinishedFileName(circuitPath);


    const entropy = givenEntropy
        ? Buffer.from(givenEntropy).toHex()
        : randomBytes(32).toHex();
    const contributor = contributorName ?? 'anon';

    await $`bun snarkjs zkb ${input} ${out} ${entropy} 20 -n=${contributor} -v`;
    console.log(`Zkey with beacon saved at: ${out}`);
}

export const addZkeyFinish: AddCmd = (cli) => cli.command(
    'zkey-finish [circuitPath]',
    'Adds a random contribution to latest zkey file',
    (yargs) => yargs.positional('circuitPath', {
        type: 'string',
        default: 'circuits/main.circom',
        demandOption: false
    }).option('entropy', {
        alias: ['e'],
        type: 'string',
        demandOption: false
    }).option('name', {
        alias: ['n'],
        type: 'string',
        demandOption: false
    }),
    async (yargs) => {
        return zkeyFinish(yargs.circuitPath, yargs.entropy, yargs.name);
    }
)