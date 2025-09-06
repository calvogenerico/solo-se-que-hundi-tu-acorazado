import { $, baseDir } from "../utils";
import YAML from 'yaml';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from "node:path";
import type { AddCmd } from "../cli";
import { z } from 'zod';

const argsSchema = z.object({
    circuit: z.object({
        inputs: z.object({
            a: z.coerce.bigint(),
            b: z.coerce.bigint(),
        })
    })
});

export function inputsFilePath() {
    const base = baseDir();
    return join(base, 'out', 'inputs.json');
}

async function generateInput() {
    const base = baseDir();
    const file = await readFile(join(base, 'arguments.yaml'));
    const obj = YAML.parse(file.toString());

    const parsed = argsSchema.parse(obj);

    const { a, b } = parsed.circuit.inputs;

    const inputsFileContent = JSON.stringify({
        a: a.toString(),
        b: b.toString()
    });


    const inputsPath = inputsFilePath();
    await writeFile(inputsPath, inputsFileContent);
    console.log(`Inputs generated at: ${inputsPath}`);
}

export const addGenerateInput: AddCmd = (cli) => cli.command(
    'input', 
    'generates input for main circuit',
    {},
    generateInput
)