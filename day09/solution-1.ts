import { readFileSync } from 'fs';

const directions = ['D', 'U', 'L', 'R'] as const;
type Direction = typeof directions[number];
const isDirection = (char: string): char is Direction => {
  return directions.includes(char as Direction);
};

interface Move {
  direction: Direction;
  numSteps: number;
}

const ingestInput = (filename: string): Move[] => {
  return readFileSync(filename, 'utf8')
    .trimEnd()
    .split('\n')
    .map((line) => {
      const [direction, numSteps] = line.split(' ');
      if (!isDirection(direction)) throw new Error(`Invalid direction in move: ${line}`);
      return {
        direction,
        numSteps: Number(numSteps),
      };
    });
};

const result = (filename: string): number => {
  const moves = ingestInput(filename);
  const visited = new Set<string>();

  // For this puzzle, increasing Y moves the piece up
  let headX = 0;
  let headY = 0;
  let tailX = 0;
  let tailY = 0;

  visited.add(`${tailX},${tailY}`);
  for (const { direction, numSteps } of moves) {
    for (let i = 0; i < numSteps; i++) {
      if (direction === 'D') {
        headY--;
      } else if (direction === 'U') {
        headY++;
      } else if (direction === 'L') {
        headX--;
      } else if (direction === 'R') {
        headX++;
      }

      const xOffset = headX - tailX;
      const yOffset = headY - tailY;
      if (xOffset === 2) {
        tailX++;
        tailY = headY;
      } else if (xOffset === -2) {
        tailX--;
        tailY = headY;
      } else if (yOffset === 2) {
        tailY++;
        tailX = headX;
      } else if (yOffset === -2) {
        tailY--;
        tailX = headX;
      }

      visited.add(`${tailX},${tailY}`);
    }
  }
  return visited.size;
};

// Test
console.log(result('day09/test-input.txt'));
// 13

// Solution
console.log(result('day09/input.txt'));
// 6011
