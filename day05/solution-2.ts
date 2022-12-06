import { readFileSync } from 'fs';

import _ from 'lodash';

const singleLetterRegex = /^[A-Z]$/;
const isSingleLetter = (content: string): boolean => {
  return singleLetterRegex.test(content);
};

const movesRegex = /^move (\d+) from (\d+) to (\d+)$/;

interface Move {
  numCrates: number;
  from: number;
  to: number;
}

interface State {
  stacks: string[][];
  moves: Move[];
}

const ingestInput = (filename: string): State => {
  const [stackInput, movesInput] = readFileSync(filename, 'utf8')
    .trimEnd()
    .split('\n\n')
    .map((inputPart) => inputPart.split('\n'));

  // Ingest initial stack
  stackInput.pop();
  const numStacks = Math.ceil(stackInput[0].length / 4);
  const stacks = Array(numStacks)
    .fill(null)
    .map(() => Array<string>(0));
  for (const line of stackInput) {
    for (let i = 0; i < numStacks; i++) {
      const index = i * 4 + 1;
      const content = line[index];
      // console.log(`On line ${line}, for stack ${i + 1}, content is: ${content}`);
      if (isSingleLetter(content)) {
        stacks[i].unshift(content);
      } else if (content !== ' ') {
        throw new Error(`Crate has invalid content: ${content}`);
      }
    }
  }

  // Ingest moves
  const moves = movesInput.map((line) => {
    const matches = movesRegex.exec(line);
    if (!matches) throw new Error(`Invalid move: ${line}`);
    return {
      numCrates: Number(matches[1]),
      from: Number(matches[2]) - 1,
      to: Number(matches[3]) - 1,
    };
  });

  return {
    stacks,
    moves,
  };
};

/**
 * Warning: this mutates state input
 */
const executeMoves = (state: State): void => {
  for (const move of state.moves) {
    const fromStack = state.stacks[move.from];
    const toStack = state.stacks[move.to];
    const contents = fromStack.slice(-move.numCrates);
    fromStack.splice(-move.numCrates, move.numCrates);
    contents.forEach((content) => toStack.push(content));
  }
};

const result = (filename: string): string => {
  const state = ingestInput(filename);
  executeMoves(state);
  return state.stacks.map((stack) => stack.at(-1)).join('');
};

// Test
console.log(result('day05/test-input.txt'));
// MCD

// Solution
console.log(result('day05/input.txt'));
// TZLTLWRNF
