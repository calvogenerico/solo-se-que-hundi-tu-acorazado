import { hideBin } from 'yargs/helpers';
import { buildCli } from './cli'
import { addCompile } from './commands/compile'
import { addClean } from './commands/clean';
import { addGenerateMainInput } from './commands/generate-input';
import { addWitness } from './commands/witness';
import { addDownloadPtau } from './commands/download-ptau';
import { addZkeyGen } from './commands/zkey-generate.ts';
import { addZkeyContrib } from "./commands/zkey-contribute.ts";
import { addZkeyFinish } from "./commands/zkey-finish.ts";


const cli = buildCli();

const allCommands = [
    addCompile,
    addClean,
    addGenerateMainInput,
    addWitness,
    addDownloadPtau,
    addZkeyGen,
    addZkeyContrib,
    addZkeyFinish
];

for (const addCmd of allCommands) {
    addCmd(cli);
}



await cli.parseAsync(hideBin(process.argv));
