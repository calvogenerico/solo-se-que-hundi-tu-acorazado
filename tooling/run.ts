import { hideBin } from 'yargs/helpers';
import { buildCli } from './cli'
import { addCompile } from './commands/compile'
import { addClean } from './commands/clean';
import { addGenerateInput } from './commands/generate-input';
import { addWitness } from './commands/witness';
import { addDownloadPtau } from './commands/download-ptau';


const cli = buildCli();

const allCommands = [
    addCompile,
    addClean,
    addGenerateInput,
    addWitness,
    addDownloadPtau
];

for (const addCmd of allCommands) {
    addCmd(cli);
}



await cli.parseAsync(hideBin(process.argv));
