import { $, baseDir } from "../utils";
import YAML from 'yaml';
import { readFile, writeFile } from 'node:fs/promises';
import { join, parse } from "node:path";
import type { AddCmd } from "../cli";
import { z } from 'zod';
import { circuitOutDir } from "./compile.ts";

export const argsSchema = z.object({
    circuit: z.object({
        inputs: z.object({
            smallShipStartX: z.coerce.bigint(),
            smallShipStartY: z.coerce.bigint(),
            smallShipIsVertical: z.coerce.bigint(),
            smallShipSize: z.coerce.bigint(),
            bigShipStartX: z.coerce.bigint(),
            bigShipStartY: z.coerce.bigint(),
            bigShipIsVertical: z.coerce.bigint(),
            bigShipSize: z.coerce.bigint(),
            hSize: z.coerce.bigint(),
            vSize: z.coerce.bigint(),
            hitX: z.coerce.bigint(),
            hitY: z.coerce.bigint(),
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

    const {
        smallShipStartX,
        smallShipStartY,
        smallShipIsVertical,
        smallShipSize,
        bigShipStartX,
        bigShipStartY,
        bigShipIsVertical,
        bigShipSize,
        hSize,
        vSize,
        hitX,
        hitY
    } = parsed.circuit.inputs;

    const inputsFileContent = {
        smallShipStartX,
        smallShipStartY,
        smallShipIsVertical,
        smallShipSize,
        bigShipStartX,
        bigShipStartY,
        bigShipIsVertical,
        bigShipSize,
        hSize,
        vSize,
        hitX,
        hitY
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