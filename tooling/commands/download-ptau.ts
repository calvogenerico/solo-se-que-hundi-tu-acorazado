import type { AddCmd } from "../cli";
import { $, baseDir } from "../utils";
import { join } from 'node:path';

export function ptauFilePath() {
    const base = baseDir();
    return join(base, 'out', 'perpetualtaus-17.ptau');
}

async function downloadPtau() {
    await $`wget https://pse-trusted-setup-ppot.s3.eu-central-1.amazonaws.com/pot28_0080/ppot_0080_17.ptau --output-document=${ptauFilePath()}`
}

export const addDownloadPtau: AddCmd = (cli) =>  cli.command(
    'download-ptau',
    'dowloads a ptau file from perpetuals powers of tau large enough to feet the circuit using groth16',
    {},
    downloadPtau
)