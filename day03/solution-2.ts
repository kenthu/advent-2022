import { readFileSync } from 'fs';

import _ from 'lodash';

const ingestInput = (filename: string): [string, string, string][] => {
  const lines = readFileSync(filename, 'utf8').trim().split('\n');
  return _.chunk(lines, 3) as [string, string, string][];
};

const badge = ([elf1, elf2, elf3]: [string, string, string]): string => {
  const elf1Items = new Set(elf1.split(''));
  const elf2Items = new Set(elf2.split(''));
  const badge = elf3.split('').find((item) => elf1Items.has(item) && elf2Items.has(item));
  if (badge === undefined) {
    throw new Error('Could not find badge');
  }
  return badge;
};

const priority = (item: string): number => {
  // Lowercase item types a through z have priorities 1 through 26.
  // Uppercase item types A through Z have priorities 27 through 52.

  const ascii = item.charCodeAt(0);
  // Lowercase: a => 97
  if (ascii >= 97) return ascii - 96;
  // Uppercase: A => 65
  return ascii - 38;
};

const result = (filename: string) => {
  const elfGroups = ingestInput(filename);
  return elfGroups.reduce((acc, elfGroup) => acc + priority(badge(elfGroup)), 0);
};

// Part 2 test
console.log(result('day03/test-input.txt'));
// 70

// Part 2
console.log(result('day03/input.txt'));
// 2681
