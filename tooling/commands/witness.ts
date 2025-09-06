import type { AddCmd } from "../cli";
import { baseDir, $ } from "../utils";
import { join } from 'node:path';
import { exists }  from 'node:fs/promises';
import { inputsFilePath } from "./generate-input";

export function witnessFilePath() {
    const base = baseDir();
    return join(base, 'out', 'main.wtns');
}

async function witness() {
    const base = baseDir();
    const jsDir = join(base, 'out', 'main_js');
    const inputsPath = inputsFilePath();


    if (!await exists(jsDir)) {
        throw new Error(`Directory "${jsDir}" does not exist. Maybe you are missing the compile step.`);
    }

    if (!await exists(inputsPath)) {
        throw new Error(`Inputs not found under "${inputsPath}". Maybe you are missing the generate inputs step.`);
    }

    const outPath = witnessFilePath();
    await $`node generate_witness.js main.wasm ${inputsPath} ${outPath}`.cwd(jsDir);
    console.log(`Witness file correctly generated at: ${outPath}`);
}

export const addWitness: AddCmd = (cli) => cli.command('witness', 'generates witnes', {}, witness)
