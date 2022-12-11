import { readFileSync } from 'fs';

interface InstructionAddx {
  command: 'addx';
  value: number;
}

interface InstructionNoop {
  command: 'noop';
}

type Instruction = InstructionAddx | InstructionNoop;

const ingestInput = (filename: string): Instruction[] => {
  return readFileSync(filename, 'utf8')
    .trimEnd()
    .split('\n')
    .map((line) => {
      if (line.startsWith('addx ')) {
        return {
          command: 'addx',
          value: Number(line.slice(5)),
        };
      } else if (line === 'noop') {
        return {
          command: 'noop',
        };
      } else {
        throw new Error(`Invalid command: ${line}`);
      }
    });
};

const result = (filename: string): number => {
  const instructions = ingestInput(filename);
  let register = 1;
  const registerHist: number[] = [];
  for (const instruction of instructions) {
    if (instruction.command === 'noop') {
      registerHist.push(register);
    } else {
      registerHist.push(register);
      registerHist.push(register);
      register += instruction.value;
    }
  }

  return [20, 60, 100, 140, 180, 220].reduce((acc, cycleNum) => {
    const signalStrength = cycleNum * registerHist[cycleNum - 1];
    return acc + signalStrength;
  }, 0);
};

// Test
console.log(result('day10/test-input.txt'));
// 13140

// Solution
console.log(result('day10/input.txt'));
// 13820
