import { $, Glob } from "bun";
import type { AddCmd } from "../cli";
import { circuitOutDir, r1csFilePath } from "./compile";
import { ptauFilePath } from "./download-ptau";
import { join, parse } from 'node:path';
import { exists } from 'node:fs/promises'

function rawZkeyFilePath(circuitPath: string) {
    const base = circuitOutDir(circuitPath);
    const parsed = parse(circuitPath);
    return join(base, `${parsed.name}.000.zkey`);
}

export async function removeOldZkeyFiles(circuitPath: string) {
    const base = circuitOutDir(circuitPath);
    const glob = new Glob(join(base, '*.zkey'));
    for await (const filePath of glob.scan()) {
        await $`rm ${filePath}`;
    }
}

export async function zkeyGen(circuitPath: string) {
    const r1csPath = r1csFilePath(circuitPath);
    const ptauPath = ptauFilePath();

    if (!await exists(r1csPath)) {
        throw new Error(`Missing r1cs file at "${r1csPath}". Maybe compile step is missing.`);
    }

    if (!await exists(ptauPath)) {
        throw new Error(`Missing ptau file at "${ptauPath}". Maybe download ptau step is missing step is missing.`);
    }

    const out = rawZkeyFilePath(circuitPath);
    await removeOldZkeyFiles(circuitPath);
    await $`bun snarkjs groth16 setup ${r1csPath} ${ptauPath} ${out}`;
    console.log(`Zkey generated at: ${out}`);
}

export const addZkeyGen: AddCmd = (cli) => cli.command(
    'zkey-gen [circuitPath]',
    'Generates zkey file',
    (yargs) => yargs.positional('circuitPath', {
        type: 'string',
        default: 'circuits/main.circom',
        demandOption: false
    }),
    async (yargs) => {
        return zkeyGen(yargs.circuitPath)
    }
)