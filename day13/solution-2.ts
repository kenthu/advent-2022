import { readFileSync } from 'fs';

type Expr = number | Expr[];

const compareFn = (left: Expr, right: Expr): -1 | 0 | 1 => {
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

    switch (compareFn(leftVal, rightVal)) {
      case -1:
        return -1;
      case 1:
        return 1;
    }
  }
  return 0;
};

class Solver {
  packets: Expr[];

  constructor(filename: string) {
    // I can visually inspect and see that all values are just arrays of numbers, so it's safe to
    // eval.
    this.packets = readFileSync(filename, 'utf8')
      .trimEnd()
      .replace(/\n\n/g, '\n')
      .split('\n')
      .map((expr) => eval(expr) as Expr[]);
  }

  result(): number {
    this.packets.push([[2]]);
    this.packets.push([[6]]);
    this.packets.sort(compareFn);

    return (
      (this.packets.findIndex((expr) => JSON.stringify(expr) === '[[2]]') + 1) *
      (this.packets.findIndex((expr) => JSON.stringify(expr) === '[[6]]') + 1)
    );
  }
}

// Test
console.log(new Solver('day13/test-input.txt').result());
// 140

// Solution
console.log(new Solver('day13/input.txt').result());
// 20304
