import type { AddCmd } from '../cli'
import { $, baseDir } from '../utils';
import { join } from 'node:path';

export function r1csFilePath() {
    const base = baseDir();
    return join(base, 'out', 'main.r1cs');
}

async function compile() {
    await $`mkdir -p out`;
    await $`circom circuits/main.circom --r1cs --wasm --sym -o out`
    await $`echo '{}' > out/main_js/package.json`
}


export const addCompile: AddCmd = (cli) => {
    return cli.command(
        'compile', 
        'compiles the circuit', 
        {}, 
        async () => {
            await compile();
        }
    );
}