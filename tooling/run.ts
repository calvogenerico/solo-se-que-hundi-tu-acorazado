import { hideBin } from 'yargs/helpers';
import { buildCli } from './cli'
import { addCompile } from './commands/compile'
import { addClean } from './commands/clean';
import { addGenerateMainInput } from './commands/generate-input';
import { addWitness } from './commands/witness';
import { addDownloadPtau } from './commands/download-ptau';
import { addZkeyGen } from './commands/generate-zkey';
import { addZkeyContrib } from "./commands/contribute-zkey.ts";


const cli = buildCli();

const allCommands = [
    addCompile,
    addClean,
    addGenerateMainInput,
    addWitness,
    addDownloadPtau,
    addZkeyGen,
    addZkeyContrib
];

for (const addCmd of allCommands) {
    addCmd(cli);
}



await cli.parseAsync(hideBin(process.argv));
