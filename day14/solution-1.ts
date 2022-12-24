import { readFileSync } from 'fs';

import _ from 'lodash';

interface Point {
  x: number;
  y: number;
}

class Solver {
  grid: boolean[][];
  paths: Point[][];
  maxY: number;
  unitsOfSandAtRest = 0;
  sandGoingIntoAbyss = false;

  constructor(filename: string) {
    this.paths = readFileSync(filename, 'utf8')
      .trimEnd()
      .split('\n')
      .map((path) => {
        return path.split(' -> ').map<Point>((pair) => {
          const [x, y] = pair.split(',');
          return { x: Number(x), y: Number(y) };
        });
      });

    // Initialize grid
    const allPoints = _.flatten(this.paths);
    const maxX = _.max(allPoints.map((point) => point.x));
    const maxY = _.max(allPoints.map((point) => point.y));
    if (maxX === undefined || maxY === undefined) throw new Error('Could not determine grid size');
    this.grid = new Array(maxY + 2).fill(0).map(() => Array<boolean>(maxX + 1).fill(false));
    this.maxY = maxY;

    this.drawPaths();
  }

  drawPaths(): void {
    for (const path of this.paths) {
      let current = path[0];
      this.grid[current.y][current.x] = true;

      for (const nextPoint of path.slice(1)) {
        // Draw all the points from current to nextPoint
        if (current.x === nextPoint.x) {
          const minY = Math.min(current.y, nextPoint.y);
          const maxY = Math.max(current.y, nextPoint.y);
          for (let y = minY; y <= maxY; y++) {
            this.grid[y][current.x] = true;
          }
        } else if (current.y === nextPoint.y) {
          const minX = Math.min(current.x, nextPoint.x);
          const maxX = Math.max(current.x, nextPoint.x);
          for (let x = minX; x <= maxX; x++) {
            this.grid[current.y][x] = true;
          }
        }

        current = nextPoint;
      }
    }
  }

  printGrid(): void {
    for (const row of this.grid) {
      for (let i = 492; i < row.length; i++) {
        process.stdout.write(row[i] ? '#' : '.');
      }
      console.log();
    }
  }

  addSand(): void {
    const sand: Point = { x: 500, y: 0 };

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (!this.grid[sand.y + 1][sand.x]) {
        sand.y++;
      } else if (!this.grid[sand.y + 1][sand.x - 1]) {
        sand.y++;
        sand.x--;
      } else if (!this.grid[sand.y + 1][sand.x + 1]) {
        sand.y++;
        sand.x++;
      } else {
        this.grid[sand.y][sand.x] = true;
        this.unitsOfSandAtRest++;
        return;
      }

      if (sand.y > this.maxY) {
        this.sandGoingIntoAbyss = true;
        return;
      }
    }
  }

  result(): number {
    while (!this.sandGoingIntoAbyss) {
      this.addSand();
    }

    return this.unitsOfSandAtRest;
  }
}

// Test
console.log(new Solver('day14/test-input.txt').result());
// 24

// Solution
console.log(new Solver('day14/input.txt').result());
// 795
