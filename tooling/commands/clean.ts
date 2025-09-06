import type { AddCmd } from "../cli";
import { $ } from "../utils";

async function clean() {
    await $`rm -rv out/*`
}

export const addClean: AddCmd = (cli) => {
    return cli.command('clean', 'clean genrated files', {}, clean);
}