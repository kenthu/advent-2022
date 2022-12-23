import { readFileSync } from 'fs';
import { EventEmitter } from 'node:events';

type Operator = '+' | '-' | '*' | '/';
const isOperator = (input: string): input is Operator => {
  return ['+', '-', '*', '/'].includes(input);
};

interface Expression {
  monkey1: string;
  operator: Operator;
  monkey2: string;
}

interface BaseMonkey {
  name: string;
}

interface NumberMonkey extends BaseMonkey {
  type: 'number';
  number: number;
}
const isNumberMonkey = (monkey: Monkey): monkey is NumberMonkey => {
  return monkey.type === 'number';
};

interface ExpressionMonkey extends BaseMonkey {
  type: 'expression';
  expression: Expression;
}

type Monkey = NumberMonkey | ExpressionMonkey;

const monkeyInputRegex = /^([a-z]{4}): (?:(\d+)|(?:([a-z]{4}) ([+\-*/]) ([a-z]{4})))$/;
const ingestMonkey = (line: string): Monkey => {
  const matches = monkeyInputRegex.exec(line);
  if (!matches) throw new Error(`Unable to process line: ${line}`);
  const name = matches[1];
  if (matches[2]) {
    return {
      name,
      type: 'number',
      number: Number(matches[2]),
    };
  } else if (isOperator(matches[4])) {
    return {
      name,
      type: 'expression',
      expression: {
        monkey1: matches[3],
        operator: matches[4],
        monkey2: matches[5],
      },
    };
  } else {
    throw new Error(`Unable to process line: ${line}`);
  }
};

const ingestInput = (filename: string): Monkey[] => {
  return readFileSync(filename, 'utf8')
    .trimEnd()
    .split('\n')
    .map((line) => ingestMonkey(line));
};

const result = (filename: string): number => {
  const monkeys = ingestInput(filename);
  const monkeyNums = new Map<string, number>();
  const emitter = new EventEmitter();

  const handleNumber = (name: string, number: number): void => {
    if (name === 'root') {
      console.log(`The answer is: ${number}`);
      process.exit();
    }
    monkeyNums.set(name, number);
    emitter.emit(name);
  };

  const evaluateExpression = (x: number, operator: Operator, y: number): number => {
    switch (operator) {
      case '+':
        return x + y;
      case '-':
        return x - y;
      case '*':
        return x * y;
      case '/':
        return x / y;
    }
  };

  /** Set of monkeys that have already had listeners set on them */
  const listenersSet = new Set<string>();

  const handleExpression = (name: string, expression: Expression): void => {
    const { monkey1, operator, monkey2 } = expression;
    const x = monkeyNums.get(monkey1);
    const y = monkeyNums.get(monkey2);

    // If either number is unknown, then set listeners to re-check this once a number becomes known
    if (x === undefined || y === undefined) {
      // If listeners already set for this monkey, we're done
      if (listenersSet.has(name)) {
        return;
      }

      if (x === undefined) {
        emitter.on(monkey1, () => {
          handleExpression(name, expression);
        });
      }
      if (y === undefined) {
        emitter.on(monkey2, () => {
          handleExpression(name, expression);
        });
      }
      listenersSet.add(name);
      return;
    }

    const value = evaluateExpression(x, operator, y);
    handleNumber(name, value);
  };

  for (const monkey of monkeys) {
    if (isNumberMonkey(monkey)) {
      handleNumber(monkey.name, monkey.number);
    } else {
      handleExpression(monkey.name, monkey.expression);
    }
  }

  return monkeyNums.get('root') as number;
};

// Test
console.log(result('day21/test-input.txt'));
// 152

// Solution
console.log(result('day21/input.txt'));
// 84244467642604
