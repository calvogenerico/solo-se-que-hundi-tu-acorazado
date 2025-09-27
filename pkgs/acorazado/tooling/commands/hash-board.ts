import type { AddCmd } from '../cli.ts';
import { baseDir } from '../utils.ts';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import YAML from 'yaml';
import { argsSchema } from './generate-input.ts';
import { poseidon4 } from 'poseidon-lite';

async function hashBoard() {
  const base = baseDir();
  const file = await readFile(join(base, 'arguments.yaml'));
  const obj = YAML.parse(file.toString());

  const parsed = argsSchema.parse(obj).circuit.inputs;

  const bigShipHash = poseidon4([
    parsed.bigShipStartX,
    parsed.bigShipStartY,
    parsed.bigShipIsVertical,
    parsed.bigShipSize
  ]);

  const smallShipHash = poseidon4([
    parsed.smallShipStartX,
    parsed.smallShipStartY,
    parsed.smallShipIsVertical,
    parsed.smallShipSize
  ]);

  const finalHash = poseidon4([smallShipHash, bigShipHash, parsed.hSize, parsed.vSize]);

  console.log(finalHash.toString());
}

export const addHashBoard: AddCmd = (cli) =>
  cli.command('hash-board', 'generates a valid hash for the board arguments.yaml', {}, hashBoard);
