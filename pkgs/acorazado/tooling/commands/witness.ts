import type { AddCmd } from "../cli";
import { $ } from "../utils";
import { join } from 'node:path';
import { inputsFilePath } from "./generate-input";
import { circuitOutDir, jsDirName, wasmFilePath } from "./compile.ts";
import { existsSync } from "node:fs";

export function witnessFilePath(circuitPath: string) {
    const base = circuitOutDir(circuitPath);
    return join(base, 'out.wtns');
}

export async function witness(circuitPath: string) {
    const jsDir = jsDirName(circuitPath);
    const inputsPath = inputsFilePath(circuitPath);

    if (!existsSync(jsDir)) {
        throw new Error(`Directory "${jsDir}" does not exist. Maybe you are missing the compile step.`);
    }

    if (!existsSync(inputsPath)) {
        throw new Error(`Inputs not found under "${inputsPath}". Maybe you are missing the generate inputs step.`);
    }

    const outPath = witnessFilePath(circuitPath);
    await $({cwd: jsDir})`node generate_witness.js ${wasmFilePath(circuitPath)} ${inputsPath} ${outPath}`;
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
