import type { AddCmd } from "../cli";
import { $ } from "../utils.ts";
import { runTest } from "./run-test.ts";
import { join } from "node:path";
import { runFailTest } from "./run-fail-test.ts";
import { runErrorTest } from "./run-error-test.ts";


async function runAllTests() {
    const lsOutput = await $`ls tests`.text();
    const files = lsOutput
        .trim()
        .split('\n')
        .map(line => join('tests', line.trim()) )

    const successTests = files.filter(file => file.endsWith('test.circom'));

    for (const test of successTests) {
        console.log(`Running ${test}...`)
        try {
            await runTest(test);
        } catch (e) {
            console.error(`Error running: ${test}`);
            process.exit(1);
        }
    }

    const compileFailTests = files.filter(file => file.endsWith('fail.circom'));

    for (const test of compileFailTests) {
        console.log(`Running ${test}...`)
        try {
            await runFailTest(test);
        } catch (e) {
            console.error(`Error running: ${test}. Should have fail to compile bit it didn't`);
            process.exit(1);
        }
    }

    const errTests = files.filter(file => file.endsWith('error.circom'));

    for (const test of errTests) {
        console.log(`Running ${test}...`)
        try {
            await runErrorTest(test);
        } catch (e) {
            console.error(`Error running: ${test}. Should have errored out on execution bit it didn't`);
            process.exit(1);
        }
    }

    console.log('\nAll test ran successfully!');
}

export const addRunAllTests: AddCmd = (cli) => cli.command(
    'test-all',
    'run all tests test and expect it to fail',
    (yargs) => yargs.positional('testName', {
        type: 'string',
        demandOption: true
    }),
    async (yargs) => runAllTests()
)