import type { AddCmd } from "../cli";
import { circuitOutDir } from "./compile";
import { join, parse } from "node:path";
import { randomBytes } from "node:crypto";
import { $ } from "../utils.ts";
import { readdir } from "node:fs/promises";

const zkeyPattern = /(\d\d\d).zkey$/;

export async function lastZkeyFilePath(circuitPath: string): Promise<string> {
    const base = circuitOutDir(circuitPath);
    const files = await readdir(base);
    const zKeys = files.filter((entry: string) => zkeyPattern.test(entry)).toSorted();
    const last = zKeys.at(-1);
    if (!last) {
        throw new Error("No zkey generated. Maybe zkey-gen step is missing");
    }

    return join(base, last);
}

function nextZkeyFileName(current: string) {
    const parsed = parse(current);
    const match = parsed.base.match(zkeyPattern);
    if (match === null) {
        throw new Error('invalid zkey file name');
    }
    const nextIndex = Number(match[1]!) + 1;
    const formated = nextIndex.toString().padStart(3, '0');

    return join(parsed.dir, `${parsed.name.replace(match[1]!, formated)}.zkey`)
}

export async function zkeyContrib(circuitPath: string, givenEntropy?: string, contributorName?: string) {
    const lastZkey = await lastZkeyFilePath(circuitPath);
    const nextZkey = nextZkeyFileName(lastZkey);

    const entropy = givenEntropy ?? randomBytes(32).toString('hex');
    const contributor = contributorName ?? 'anon';

    await $`bun snarkjs zkc ${lastZkey} ${nextZkey} -e=${entropy} -n=${contributor}`;
    console.log(`Contribution saved at: ${nextZkey}`);
}

export const addZkeyContrib: AddCmd = (cli) => cli.command(
    'zkey-contrib [circuitPath]',
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
        return zkeyContrib(yargs.circuitPath, yargs.entropy, yargs.name);
    }
)