import {$} from 'bun'
import type { AddCmd } from '../cli'

async function compile() {
    await $`echo from compile!`
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