import { readFileSync } from 'fs';

import _ from 'lodash';

/**
 * @returns # of calories carried by each elf
 */
const ingestInput = (filename: string): number[] => {
  return readFileSync(filename, 'utf8')
    .trim()
    .split('\n\n')
    .map((elf) => elf.split('\n').map((calories) => Number(calories)))
    .map((elf) => _.sum(elf));
};

/**
 * @returns calories carried for the n elves carrying the most calories
 */
const getMax = (filename: string, n: number): number[] => {
  const elves = ingestInput(filename);
  console.log(elves);
  return _.sortBy(elves).slice(-n);
};

// Part 1 test
console.log(getMax('day01/test-input.txt', 1)[0]);

// Part 1
console.log(getMax('day01/input.txt', 1)[0]);

// Part 2 test
console.log(_.sum(getMax('day01/test-input.txt', 3)));

// Part 2
console.log(_.sum(getMax('day01/input.txt', 3)));
