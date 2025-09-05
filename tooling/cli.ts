import yargs from 'yargs';


export function buildCli() {
    return yargs()
        .scriptName('tool')
        .help()
        .strict();
}

export type Cli = ReturnType<typeof buildCli>;

export type AddCmd = (builder: Cli) => Cli;


