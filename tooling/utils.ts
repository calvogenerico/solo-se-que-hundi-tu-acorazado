import { join } from 'node:path'
import { $ as bunShell } from 'bun';

export function baseDir() {
    return join(import.meta.dirname, '..');
}

bunShell.cwd(baseDir());

export const $ = bunShell;