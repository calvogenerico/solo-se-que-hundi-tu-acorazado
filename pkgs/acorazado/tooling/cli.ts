import yargs from 'yargs';
import { ProcessOutput } from "zx";
// import { $ } from 'dax-sh';

export function buildCli() {
    return yargs()
        .scriptName('tool')
        .help()
        .fail(function (msg, err, yargs) {
            if (err instanceof ProcessOutput) {
                process.exit(1);
            }
            if (err) throw err // preserve stack
            console.error(yargs.help())
            console.log('----');
            console.error('Msg', msg);
            process.exit(1)
        })
        .strict();
}

export type Cli = ReturnType<typeof buildCli>;

export type AddCmd = (builder: Cli) => Cli;


