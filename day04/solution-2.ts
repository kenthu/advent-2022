import { readFileSync } from 'fs';

interface ElfPair {
  elf1Low: number;
  elf1High: number;
  elf2Low: number;
  elf2High: number;
}

const ingestInput = (filename: string): ElfPair[] => {
  const lines = readFileSync(filename, 'utf8').trim().split('\n');
  const regex = /^(\d+)-(\d+),(\d+)-(\d+)$/;
  return lines.map((line) => {
    const match = regex.exec(line);
    if (match === null) {
      throw new Error(`Line "${line}" did not match regex`);
    }

    return {
      elf1Low: Number(match[1]),
      elf1High: Number(match[2]),
      elf2Low: Number(match[3]),
      elf2High: Number(match[4]),
    };
  });
};

const result = (filename: string) => {
  const elfPairs = ingestInput(filename);
  return elfPairs.filter(
    ({ elf1Low, elf1High, elf2Low, elf2High }) => elf1High >= elf2Low && elf1Low <= elf2High,
  ).length;
};

// Test
console.log(result('day04/test-input.txt'));
// 2

// Solution
console.log(result('day04/input.txt'));
// 494
