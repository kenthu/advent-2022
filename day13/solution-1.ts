import { readFileSync } from 'fs';

type Expr = number | Expr[];

interface Pair {
  left: Expr[];
  right: Expr[];
}

class Solver {
  pairs: Pair[];

  constructor(filename: string) {
    // I can visually inspect and see that all pairs are just arrays of numbers, so it's safe to
    // eval.
    this.pairs = readFileSync(filename, 'utf8')
      .trimEnd()
      .split('\n\n')
      .map((pair) => {
        const [left, right] = pair.split('\n').map((expr) => eval(expr));
        return {
          left: left as Expr[],
          right: right as Expr[],
        };
      });
  }

  compareFn(left: Expr, right: Expr): -1 | 0 | 1 {
    if (typeof left === 'number' && typeof right === 'number') {
      if (left < right) return -1;
      if (left > right) return 1;
      return 0;
    }

    // Either left or right might still be a number, so convert to list before continuing;
    const leftList = typeof left === 'number' ? [left] : left;
    const rightList = typeof right === 'number' ? [right] : right;

    // Compare each value
    const maxLength = Math.max(leftList.length, rightList.length);
    for (let i = 0; i < maxLength; i++) {
      const leftVal = leftList[i];
      const rightVal = rightList[i];
      if (leftVal === undefined) return -1;
      if (rightVal === undefined) return 1;

      switch (this.compareFn(leftVal, rightVal)) {
        case -1:
          return -1;
        case 1:
          return 1;
      }
    }
    return 0;
  }

  result(): number {
    return this.pairs.reduce<number>((acc, pair, i) => {
      const { left, right } = pair;
      if (this.compareFn(left, right) <= 0) {
        return acc + i + 1;
      } else {
        return acc;
      }
    }, 0);
  }
}

// Test
console.log(new Solver('day13/test-input.txt').result());
// 13

// Solution
console.log(new Solver('day13/input.txt').result());
// 5682
