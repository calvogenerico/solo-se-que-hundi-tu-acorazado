import type { AddCmd } from '../cli'
import { $, baseDir } from '../utils';
import { join, parse, relative} from 'node:path';

export function circuitOutDir(circuitPath: string): string {
    const base = baseDir();
    const pathData = parse(circuitPath);
    const relDir = relative(base, pathData.dir);
    return join(base, 'out', relDir, pathData.name);
}

export function r1csFilePath(circuitPath: string) {
    const pathData = parse(circuitPath);
    const outDir = circuitOutDir(circuitPath);

    return join(outDir, `${pathData.name}.r1cs`);
}

async function compile(circuitPath: string) {
    const outDir = circuitOutDir(circuitPath);

    await $`mkdir -p ${outDir}`;
    await $`circom ${circuitPath} --r1cs --wasm --sym -o ${outDir}`
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