import { hideBin } from 'yargs/helpers';
import { buildCli } from './cli'
import { addCompile } from './commands/compile'


const cli = buildCli();

const allCommands = [
    addCompile
];

for (const addCmd of allCommands) {
    addCmd(cli);
}



await cli.parseAsync(hideBin(process.argv));
