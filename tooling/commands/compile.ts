import type { AddCmd } from '../cli'
import { $, baseDir } from '../utils';
import { join, parse, relative} from 'node:path';

export function r1csFilePath(circuitPath: string) {
    const base = baseDir();
    return join(base, 'out', 'main.r1cs');
}

async function compile(input: string) {
    const base = baseDir();
    const pathData = parse(input);

    const relDir = relative(base, pathData.dir);
    const outDir = join(base, 'out', relDir);

    await $`mkdir -p ${outDir}`;
    await $`circom circuits/main.circom --r1cs --wasm --sym -o ${outDir}`
    const pkgJsonPath = join(outDir, 'main_js', 'package.json');
    await $`echo '{}' > ${pkgJsonPath}`
}


export const addCompile: AddCmd = (cli) => {
    return cli.command(
        'compile [circuitPath]',
        'compiles the circuit',
        (yargs) => yargs.positional('circuitPath', {
            type: 'string',
            default: 'circuits/main.circom',
            demandOption: false
        }),
        async (args) => {
            await compile(args.circuitPath);
        }
    );
}