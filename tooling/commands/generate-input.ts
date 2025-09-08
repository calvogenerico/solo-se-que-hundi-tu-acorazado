import { $, baseDir } from "../utils";
import YAML from 'yaml';
import { readFile, writeFile } from 'node:fs/promises';
import { join, parse } from "node:path";
import type { AddCmd } from "../cli";
import { z } from 'zod';
import { circuitOutDir } from "./compile.ts";

const argsSchema = z.object({
    circuit: z.object({
        inputs: z.object({
            a: z.coerce.bigint(),
            b: z.coerce.bigint(),
        })
    })
});

export function inputsFilePath(circuitPath: string) {
    const base = circuitOutDir(circuitPath);
    return join(base, 'inputs.json');
}

export async function saveInputs(circuitPath: string, inputs: unknown): Promise<string> {
    const inputsPath = inputsFilePath(circuitPath);
    const parsed = parse(inputsPath)
    const inputsFileContent = JSON.stringify(inputs, null, 2);
    await $`mkdir -p ${parsed.dir}`;
    await writeFile(inputsPath, inputsFileContent);
    return inputsPath;
}

async function generateMainInputs() {
    const base = baseDir();
    const file = await readFile(join(base, 'arguments.yaml'));
    const obj = YAML.parse(file.toString());

    const parsed = argsSchema.parse(obj);

    const { a, b } = parsed.circuit.inputs;

    const inputsFileContent = {
        a: a.toString(),
        b: b.toString()
    };

    const circuitPath = 'circuits/main.circom';
    const outPath = await saveInputs(circuitPath, inputsFileContent);
    console.log(`Inputs generated at: ${outPath}`);
}

export const addGenerateMainInput: AddCmd = (cli) => cli.command(
    'input', 
    'generates input for main circuit',
    {},
    generateMainInputs
)