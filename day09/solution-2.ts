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

interface Position {
  x: number;
  y: number;
}

type Rope = Position[];

const ROPE_LENGTH = 10;

const result = (filename: string): number => {
  const moves = ingestInput(filename);
  const visited = new Set<string>();
  const rope: Rope = Array.from({ length: ROPE_LENGTH }, () => ({ x: 0, y: 0 }));

  const logTailVisit = (): void => {
    const tailKnot = rope.at(-1);
    if (!tailKnot) throw new Error('Rope has no knots');
    visited.add(`${tailKnot.x},${tailKnot.y}`);
  };

  const moveHead = (rope: Rope, direction: Direction): void => {
    if (direction === 'D') {
      rope[0].y--;
    } else if (direction === 'U') {
      rope[0].y++;
    } else if (direction === 'L') {
      rope[0].x--;
    } else if (direction === 'R') {
      rope[0].x++;
    }
  };

  const moveKnot = (rope: Rope, i: number): void => {
    const prevKnot = rope[i - 1];
    const thisKnot = rope[i];

    const xOffset = prevKnot.x - thisKnot.x;
    const yOffset = prevKnot.y - thisKnot.y;

    // If prev knot is not in the next column ...
    if (Math.abs(xOffset) > 1) {
      // ... then move this knot 1 cell in that direction
      thisKnot.x += xOffset / Math.abs(xOffset);
      // Also move this knot towards being in the same row as prev knot, if not already in same row
      if (yOffset !== 0) {
        thisKnot.y += yOffset / Math.abs(yOffset);
      }
    } else if (Math.abs(yOffset) > 1) {
      thisKnot.y += yOffset / Math.abs(yOffset);
      if (xOffset !== 0) {
        thisKnot.x += xOffset / Math.abs(xOffset);
      }
    }
  };

  // For this puzzle, increasing Y moves the piece up
  logTailVisit();
  for (const { direction, numSteps } of moves) {
    for (let i = 0; i < numSteps; i++) {
      moveHead(rope, direction);
      for (let ropeIndex = 1; ropeIndex < ROPE_LENGTH; ropeIndex++) {
        moveKnot(rope, ropeIndex);
      }
      logTailVisit();
    }
  }
  return visited.size;
};

// Test
console.log(result('day09/test-input.txt'));
// 1

// Solution
console.log(result('day09/input.txt'));
// 2419
