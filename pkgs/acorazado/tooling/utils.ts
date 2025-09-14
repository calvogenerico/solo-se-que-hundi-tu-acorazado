import { join } from 'node:path'
import { $ as base$ } from 'zx';

export function baseDir() {
    return join(import.meta.dirname, '..');
}


export const $ = base$({
    cwd: baseDir(),
    stdio: "inherit"
});