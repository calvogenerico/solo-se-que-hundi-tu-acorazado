import { hideBin } from 'yargs/helpers';
import { buildCli } from './cli'
import { addCompile } from './commands/compile'
import { addClean } from './commands/clean';


const cli = buildCli();

const allCommands = [
    addCompile,
    addClean
];

for (const addCmd of allCommands) {
    addCmd(cli);
}



await cli.parseAsync(hideBin(process.argv));
