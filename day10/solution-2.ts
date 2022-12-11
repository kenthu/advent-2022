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

const drawScreen = (filename: string): void => {
  const instructions = ingestInput(filename);

  let register = 1;
  const registerHist: number[] = [];

  // Run through all instructions
  for (const instruction of instructions) {
    if (instruction.command === 'noop') {
      registerHist.push(register);
    } else {
      registerHist.push(register);
      registerHist.push(register);
      register += instruction.value;
    }
  }

  // Draw screen
  let buffer = new Array<string>();
  registerHist.forEach((spritePos, i) => {
    const pixelPos = i % 40;
    const isLit = pixelPos >= spritePos - 1 && pixelPos <= spritePos + 1;
    buffer.push(isLit ? '#' : '.');
    if (i % 40 === 39) {
      console.log(buffer.join(''));
      buffer = [];
    }
  });
};

// Test
drawScreen('day10/test-input.txt');
// N/A

// Solution
drawScreen('day10/input.txt');
// ZKGRKGRK
