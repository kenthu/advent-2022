import { readFileSync } from 'fs';

import _ from 'lodash';

// For part 2, reverse the order. Start from E, and run Dijkstra's. When done, look at all nodes
// with elevation "a," and find the one we got to the fastest.

interface Node {
  elevation: string;
  visited: boolean;
  tentativeDistance: number;
  x: number;
  y: number;
}

class Solver {
  startX!: number;
  startY!: number;
  grid: Node[][];

  constructor(filename: string) {
    this.grid = readFileSync(filename, 'utf8')
      .trimEnd()
      .split('\n')
      .map((line, y) =>
        line.split('').map((cell, x) => {
          let elevation: string;
          if (cell === 'S') {
            elevation = 'a';
          } else if (cell === 'E') {
            this.startX = x;
            this.startY = y;
            elevation = 'z';
          } else {
            elevation = cell;
          }

          return { elevation, visited: false, tentativeDistance: Infinity, x, y };
        }),
      );

    if (this.startX === undefined || this.startY === undefined) {
      throw new Error('Could not find start position');
    }
  }

  lowercaseLetterRegex = /^[a-z]$/;

  /** How much higher the "to" node is compared to the "from" node */
  heightDiff(from: Node, to: Node): number {
    const fromElevation = from.elevation;
    const toElevation = to.elevation;
    if (
      !this.lowercaseLetterRegex.test(fromElevation) ||
      !this.lowercaseLetterRegex.test(toElevation)
    ) {
      throw new Error('Invalid elevation');
    }
    return toElevation.charCodeAt(0) - fromElevation.charCodeAt(0);
  }

  findUnvisitedNeighbors(current: Node): Node[] {
    const { x, y } = current;
    const unvisitedNeighbors: Node[] = [];
    let neighbor: Node;

    const offsets = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    for (const [xOffset, yOffset] of offsets) {
      neighbor = this.grid[y + yOffset]?.[x + xOffset];
      // when going backwards, destination can be at most one _lower_
      if (neighbor && !neighbor.visited && this.heightDiff(current, neighbor) >= -1) {
        unvisitedNeighbors.push(neighbor);
      }
    }

    return unvisitedNeighbors;
  }

  result(): number | undefined {
    // Add all nodes to unvisited set
    const unvisited = new Set<Node>();
    for (const row of this.grid) {
      for (const node of row) {
        unvisited.add(node);
      }
    }

    let current = this.grid[this.startY][this.startX];
    current.tentativeDistance = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const currentDistance = current.tentativeDistance;
      for (const neighbor of this.findUnvisitedNeighbors(current)) {
        neighbor.tentativeDistance = Math.min(neighbor.tentativeDistance, currentDistance + 1);
        unvisited.add(neighbor);
      }

      // Mark current node visited
      current.visited = true;
      unvisited.delete(current);

      // Find next node
      const nextNode = _.minBy(Array.from(unvisited), (node) => node.tentativeDistance);
      if (!nextNode) break;
      if (nextNode.tentativeDistance === Infinity) break;
      current = nextNode;
    }

    const nodesWithElevationA = _.flatten(this.grid).filter((node) => node.elevation === 'a');
    const distances = nodesWithElevationA.map((node) => node.tentativeDistance);
    return _.min(distances);
  }
}

// Test
console.log(new Solver('day12/test-input.txt').result());
// 29

// Solution
console.log(new Solver('day12/input.txt').result());
// 459
