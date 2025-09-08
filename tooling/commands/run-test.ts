import type { AddCmd } from "../cli";
import { compile } from "./compile.ts";
import { join } from "node:path";
import { saveInputs } from "./generate-input.ts";
import { witness } from "./witness.ts";

async function runTest(testFile: string) {
    await compile(join(testFile));
    await saveInputs(testFile, {});
    await witness(testFile);
}

export const addRunTest: AddCmd = (cli) => cli.command(
    'test <testName>',
    'run one test',
    (yargs) => yargs.positional('testName', {
        type: 'string',
        demandOption: true
    }),
    async (yargs) => runTest(yargs.testName)
)