import type { AddCmd } from "../cli";
import { baseDir, $ } from "../utils";
import { join, parse } from 'node:path';
import { exists } from 'node:fs/promises';
import { inputsFilePath } from "./generate-input";
import { circuitOutDir, jsDirName, wasmFilePath } from "./compile.ts";

export function witnessFilePath(circuitPath: string) {
    const base = circuitOutDir(circuitPath);
    return join(base, 'out.wtns');
}

export async function witness(circuitPath: string) {
    const jsDir = jsDirName(circuitPath);
    const inputsPath = inputsFilePath(circuitPath);

    if (!await exists(jsDir)) {
        throw new Error(`Directory "${jsDir}" does not exist. Maybe you are missing the compile step.`);
    }

    if (!await exists(inputsPath)) {
        throw new Error(`Inputs not found under "${inputsPath}". Maybe you are missing the generate inputs step.`);
    }

    const outPath = witnessFilePath(circuitPath);
    await $`node generate_witness.js ${wasmFilePath(circuitPath)} ${inputsPath} ${outPath}`.cwd(jsDir);
    console.log(`Witness file correctly generated at: ${outPath}`);
}

export const addWitness: AddCmd = (cli) => cli.command(
    'witness [circuitPath]',
    'generates witness',
    yargs => yargs.positional('circuitPath', {
        type: 'string',
        default: 'circuits/main.circom',
        demandOption: false
    }),
    (yargs) => witness(yargs.circuitPath)
)
