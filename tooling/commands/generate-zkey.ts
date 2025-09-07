import { $ } from "bun";
import type { AddCmd } from "../cli";
import { r1csFilePath } from "./compile";
import { ptauFilePath } from "./download-ptau";
import { baseDir } from "../utils";
import { join } from 'node:path';
import { exists } from 'node:fs/promises'

function rawZkeyFilePath() {
    const base = baseDir()
    return join(base, 'out', 'main.000.zkey');
}

async function zkeyGen() {
    const r1csPath = r1csFilePath("");
    const ptauPath = ptauFilePath();

    if (!await exists(r1csPath)) {
        throw new Error(`Missing r1cs file at "${r1csPath}". Maybe compile step is missing.`);
    }

    if (!await exists(ptauPath)) {
        throw new Error(`Missing ptau file at "${ptauPath}". Maybe download ptau step is missing step is missing.`);
    }

    const out = rawZkeyFilePath();
    await $`bun snarkjs groth16 setup ${r1csPath} ${ptauPath} ${out}`;
}

export const addZkeyGen: AddCmd = (cli) => cli.command(
    'zkey-gen',
    'Generates zkey file',
    {},
    zkeyGen
)