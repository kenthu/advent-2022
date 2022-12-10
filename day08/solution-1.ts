import { readFileSync } from 'fs';

const ingestInput = (filename: string): number[][] => {
  return readFileSync(filename, 'utf8')
    .trimEnd()
    .split('\n')
    .map((line) => line.split('').map((height) => Number(height)));
};

const result = (filename: string): number => {
  const grid = ingestInput(filename);
  const visibleTrees = new Set<string>();

  const gridHeight = grid.length;
  const gridWidth = grid[0].length;

  let currentMax: number;

  /**
   * @returns new maximum
   */
  const handleTree = (x: number, y: number, currentMax: number): number => {
    const treeHeight = grid[y][x];
    if (treeHeight > currentMax) {
      visibleTrees.add(JSON.stringify({ x, y }));
      return treeHeight;
    } else {
      return currentMax;
    }
  };

  // Scan each row ...
  for (let y = 0; y < gridHeight; y++) {
    // ... from the left
    currentMax = -1;
    for (let x = 0; x < gridWidth; x++) {
      currentMax = handleTree(x, y, currentMax);
    }

    // ... from the right
    currentMax = -1;
    for (let x = gridWidth - 1; x >= 0; x--) {
      currentMax = handleTree(x, y, currentMax);
    }
  }

  // Scan each column ...
  for (let x = 0; x < gridWidth; x++) {
    // ... from the top
    currentMax = -1;
    for (let y = 0; y < gridHeight; y++) {
      currentMax = handleTree(x, y, currentMax);
    }

    // ... from the bottom
    currentMax = -1;
    for (let y = gridHeight - 1; y >= 0; y--) {
      currentMax = handleTree(x, y, currentMax);
    }
  }

  return visibleTrees.size;
};

// Test
console.log(result('day08/test-input.txt'));
// 21

// Solution
console.log(result('day08/input.txt'));
// 1647
