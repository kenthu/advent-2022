import { readFileSync } from 'fs';

import _ from 'lodash';

const ROUNDS = 10000;

type OperationFn = (old: number) => number;

const makeOperationFn = (type: 'add' | 'multiply' | 'square', operand?: number): OperationFn => {
  if (type === 'add') {
    if (operand === undefined) throw new Error('Operand argument missing');
    return (old: number) => old + operand;
  } else if (type === 'multiply') {
    if (operand === undefined) throw new Error('Operand argument missing');
    return (old: number) => old * operand;
  } else if (type === 'square') {
    return (old: number) => old * old;
  } else {
    throw new Error(`Invalid operation type: ${type}`);
  }
};

const ingestOperationFn = (operation: string): OperationFn => {
  const regex = /^new = old ([*+]) (old|\d+)$/;
  const matches = regex.exec(operation);
  if (!matches) throw new Error(`Invalid operation: ${operation}`);
  if (matches[1] === '*') {
    if (matches[2] === 'old') {
      return makeOperationFn('square');
    } else {
      return makeOperationFn('multiply', Number(matches[2]));
    }
  } else if (matches[1] === '+') {
    return makeOperationFn('add', Number(matches[2]));
  } else {
    throw new Error(`Invalid operation: ${operation}`);
  }
};

interface Monkey {
  items: number[];
  operation: OperationFn;
  divisor: number;
  nextMonkeyIfTrue: number;
  nextMonkeyIfFalse: number;
  inspections: number;
}

const ingestMonkey = (monkey: string): Monkey => {
  const lines = monkey.split('\n');

  // line 0: Monkey #
  const monkeyNumRegex = /^Monkey (\d+):$/;
  const monkeyNumMatches = monkeyNumRegex.exec(lines[0]);
  if (!monkeyNumMatches) throw new Error();

  // line 1: Starting items
  if (!lines[1].startsWith('  Starting items: ')) throw new Error();
  const items = lines[1]
    .slice(18)
    .split(', ')
    .map((item) => Number(item));

  // line 2: Operation
  if (!lines[2].startsWith('  Operation: ')) throw new Error();
  const operation = ingestOperationFn(lines[2].slice(13));

  // line 3: Test
  if (!lines[3].startsWith('  Test: divisible by ')) throw new Error();
  const divisor = Number(lines[3].slice(21));

  // line 4: If true
  if (!lines[4].startsWith('    If true: throw to monkey ')) throw new Error();
  const nextMonkeyIfTrue = Number(lines[4].slice(29));

  // line 5: If false
  if (!lines[5].startsWith('    If false: throw to monkey ')) throw new Error();
  const nextMonkeyIfFalse = Number(lines[5].slice(30));

  return {
    items,
    operation,
    divisor,
    nextMonkeyIfTrue,
    nextMonkeyIfFalse,
    inspections: 0,
  };
};

const ingestInput = (filename: string): Monkey[] => {
  return readFileSync(filename, 'utf8')
    .trimEnd()
    .split('\n\n')
    .map((monkey) => ingestMonkey(monkey));
};

const result = (filename: string): number => {
  const monkeys = ingestInput(filename);
  const allDivisors = monkeys.reduce((acc, monkey) => acc * monkey.divisor, 1);

  _.times(ROUNDS, () => {
    monkeys.forEach((monkey) => {
      for (const worryLevel of monkey.items) {
        const newWorryLevel = monkey.operation(worryLevel);

        // Test and move
        const nextMonkey =
          newWorryLevel % monkey.divisor === 0 ? monkey.nextMonkeyIfTrue : monkey.nextMonkeyIfFalse;

        /**
         * How can we keep worry levels manageable? Well, if the test is whether the worry level is
         * divisible by 23, then we can modulo by 23, which would not change the test result.
         *
         * But what about the other operations performed before the next time we check if the worry
         * level is divisible by 23?
         * - Addition: This is fine. (n % 23 + x) % 23 = (n + x) % 23
         * - Multiplication: This is also fine. ((n % 23) * x) % 23 = (n * x) % 23. Why? If n % 23
         *   == n, then it's obviously the same. But even if n % 23 != n, that just means n % 23 = n
         *   - 23, so that's ((n - 23) * x) % 23. Since we're just shifting the ((n - 23) * x)
         *     expression by some multiple of 23, that doesn't change the ultimate modulo result.
         * - Squaring: This is the same as multiplication
         *
         * The above properties also apply when executing module on some multiple of our original
         * divisor. For example:
         *
         * (n % 46 + x) % 23 = (n + x) % 23
         *
         * So that means we can take the product of all our divisors (23 * 19 * 13 * 17) and be
         * confident that if we modulo this product, that won't change any of the test results
         * (e.g., divisible by 23 or divisible by 19), even if there are addition/multiplication
         * operations performed in between.
         */
        monkeys[nextMonkey].items.push(newWorryLevel % allDivisors);

        monkey.inspections++;
      }
      monkey.items = [];
    });
  });

  const sortedInspectionCounts = _.sortBy(monkeys.map((monkey) => monkey.inspections));
  const [secondMostActive, mostActive] = sortedInspectionCounts.slice(-2);
  return secondMostActive * mostActive;
};

// Test
console.log(result('day11/test-input.txt'));
// 2713310158

// Solution
console.log(result('day11/input.txt'));
// 25590400731
