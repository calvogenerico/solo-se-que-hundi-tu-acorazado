import type { AddCmd } from "../cli";
import { compile } from "./compile.ts";
import { join } from "node:path";
import { saveInputs } from "./generate-input.ts";
import { witness } from "./witness.ts";
import { $ } from "bun";

async function runFailTest(testFile: string) {
    try {
        await compile(join(testFile));
    } catch (e) {
        if (e instanceof $.ShellError) {
            console.log("Test failed as expected");
            return;
        }
    }
    throw new Error('Expected test to fail at compile time but it didn\'t');
}

export const addRunFailTest: AddCmd = (cli) => cli.command(
    'fail-test <testName>',
    'run one test and expect it to fail',
    (yargs) => yargs.positional('testName', {
        type: 'string',
        demandOption: true
    }),
    async (yargs) => runFailTest(yargs.testName)
)