import { readFileSync } from 'fs';

interface Rucksack {
  compartment1: string;
  compartment2: string;
}

const ingestInput = (filename: string): Rucksack[] => {
  const lines = readFileSync(filename, 'utf8').trim().split('\n');
  return lines.map((line) => {
    const compartmentSize = line.length / 2;
    return {
      compartment1: line.slice(0, compartmentSize),
      compartment2: line.slice(compartmentSize),
    };
  });
};

const errantItem = (rucksack: Rucksack): string => {
  const compartment1Items = new Set(rucksack.compartment1.split(''));
  const item = rucksack.compartment2.split('').find((item) => compartment1Items.has(item));
  if (item === undefined) {
    throw new Error(`Could not find errant item in rucksack ${rucksack}`);
  }
  return item;
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
  const rucksacks = ingestInput(filename);
  return rucksacks.reduce((acc, rucksack) => acc + priority(errantItem(rucksack)), 0);
};

// Part 1 test
console.log(result('day03/test-input.txt'));
// 157

// Part 1
console.log(result('day03/input.txt'));
// 8349
