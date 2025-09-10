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

export function jsDirName(circuitPath: string): string {
    const outDir = circuitOutDir(circuitPath);
    const parsed = parse(circuitPath);
    return join(outDir, `${parsed.name}_js`);
}

export function wasmFilePath(circuitPath: string): string {
    const dir = jsDirName(circuitPath);
    const parsed = parse(circuitPath);
    return join(dir, `${parsed.name}.wasm`);
}

export async function compile(circuitPath: string) {
    const outDir = circuitOutDir(circuitPath);

    await $`mkdir -p ${outDir}`;
    await $`circom ${circuitPath} -l node_modules --r1cs --wasm --sym -o ${outDir}`
    const pkgJsonPath = join(jsDirName(circuitPath), 'package.json');
    await $`echo '{}' > ${pkgJsonPath}`
    console.log('Success!');
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