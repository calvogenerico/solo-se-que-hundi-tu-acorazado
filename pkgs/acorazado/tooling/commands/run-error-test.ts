import type { AddCmd } from "../cli";
import { compile } from "./compile.ts";
import { join } from "node:path";
import { saveInputs } from "./generate-input.ts";
import { witness } from "./witness.ts";
import { ProcessOutput } from "zx";

export async function runErrorTest(testFile: string) {
    await compile(join(testFile));
    await saveInputs(testFile, {});

    try {
        await witness(testFile);
    } catch (e) {
        if (e instanceof ProcessOutput) {
            console.log("Test failed as expected");
            return;
        }
        return;
    }
    throw new Error('Expected test to fail at witness time but but it didn\'t');
}

export const addRunErrorTest: AddCmd = (cli) => cli.command(
    'err-test <testName>',
    'run one test and expect it to fail',
    (yargs) => yargs.positional('testName', {
        type: 'string',
        demandOption: true
    }),
    async (yargs) => runErrorTest(yargs.testName)
)