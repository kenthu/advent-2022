import { readFileSync } from 'fs';

import _ from 'lodash';

const ingestInput = (filename: string): number[][] => {
  return readFileSync(filename, 'utf8')
    .trimEnd()
    .split('\n')
    .map((line) => line.split('').map((height) => Number(height)));
};

const scenicScore = (grid: number[][], myX: number, myY: number): number => {
  const gridHeight = grid.length;
  const gridWidth = grid[0].length;
  const myHeight = grid[myY][myX];

  // Scan downwards
  let visibleTreesBelow = 0;
  for (let y = myY + 1; y < gridHeight; y++) {
    visibleTreesBelow++;
    if (grid[y][myX] >= myHeight) break;
  }

  // Scan upwards
  let visibleTreesAbove = 0;
  for (let y = myY - 1; y >= 0; y--) {
    visibleTreesAbove++;
    if (grid[y][myX] >= myHeight) break;
  }

  // Scan to the right
  let visibleTreesToRight = 0;
  for (let x = myX + 1; x < gridWidth; x++) {
    visibleTreesToRight++;
    if (grid[myY][x] >= myHeight) break;
  }

  // Scan to the left
  let visibleTreesToLeft = 0;
  for (let x = myX - 1; x >= 0; x--) {
    visibleTreesToLeft++;
    if (grid[myY][x] >= myHeight) break;
  }

  return visibleTreesBelow * visibleTreesAbove * visibleTreesToRight * visibleTreesToLeft;
};

const result = (filename: string): number => {
  const grid = ingestInput(filename);
  const scenicScores = grid.map((row, y) => row.map((_, x) => scenicScore(grid, x, y)));
  return _.max(scenicScores.map((row) => _.max(row) || -1)) || -1;
};

// Test
console.log(result('day08/test-input.txt'));
// 8

// Solution
console.log(result('day08/input.txt'));
// 392080
