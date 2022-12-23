import { readFileSync } from 'fs';

type Operator = '+' | '-' | '*' | '/';
const isOperator = (input: string): input is Operator => {
  return ['+', '-', '*', '/'].includes(input);
};

type Variable = string;

interface BinaryOp {
  operand1: Expr;
  operator: Operator;
  operand2: Expr;
}

type Expr = number | BinaryOp | Variable;

interface Monkey {
  name: string;
  value: Expr;
}

const isNumber = (expr: Expr): expr is number => {
  return typeof expr === 'number';
};

const isBinaryOp = (expr: Expr): expr is BinaryOp => {
  return typeof expr === 'object';
};

const isVariable = (expr: Expr): expr is Variable => {
  return typeof expr === 'string';
};

const monkeyInputRegex = /^([a-z]{4}): (?:(\d+)|(?:([a-z]{4}) ([+\-*/]) ([a-z]{4})))$/;
const ingestMonkey = (line: string): Monkey => {
  const matches = monkeyInputRegex.exec(line);
  if (!matches) throw new Error(`Unable to process line: ${line}`);
  const name = matches[1];
  if (matches[2]) {
    return {
      name,
      value: Number(matches[2]),
    };
  } else if (isOperator(matches[4])) {
    return {
      name,
      value: {
        operand1: matches[3],
        operator: matches[4],
        operand2: matches[5],
      },
    };
  } else {
    throw new Error(`Unable to process line: ${line}`);
  }
};

type OperatorFunction = (x: number, y: number) => number;
const getOperatorFunction = (operator: Operator): OperatorFunction => {
  switch (operator) {
    case '+':
      return (x: number, y: number) => x + y;
    case '-':
      return (x: number, y: number) => x - y;
    case '*':
      return (x: number, y: number) => x * y;
    case '/':
      return (x: number, y: number) => x / y;
  }
};
const getReverseOperatorFunction = (operator: Operator): OperatorFunction => {
  switch (operator) {
    case '+':
      return (x: number, y: number) => x - y;
    case '-':
      return (x: number, y: number) => x + y;
    case '*':
      return (x: number, y: number) => x / y;
    case '/':
      return (x: number, y: number) => x * y;
  }
};

const ingestInput = (filename: string): Record<string, Expr> => {
  return readFileSync(filename, 'utf8')
    .trimEnd()
    .split('\n')
    .reduce<Record<string, Expr>>((acc, line) => {
      const monkey = ingestMonkey(line);
      acc[monkey.name] = monkey.value;
      return acc;
    }, {});
};

const evaluate = (expr: Expr, monkeys: Record<string, Expr>): Expr => {
  if (isNumber(expr)) {
    // Already fully simplified
    return expr;
  }

  if (isBinaryOp(expr)) {
    const x = evaluate(expr.operand1, monkeys);
    const y = evaluate(expr.operand2, monkeys);

    if (isNumber(x) && isNumber(y)) {
      return getOperatorFunction(expr.operator)(x, y);
    } else {
      return {
        operand1: x,
        operator: expr.operator,
        operand2: y,
      };
    }
  }

  if (isVariable(expr)) {
    if (expr === 'humn') {
      return expr;
    }
    return evaluate(monkeys[expr], monkeys);
  }

  throw new Error(`Unrecognized expression type: ${expr}`);
};

const result = (filename: string): number => {
  const monkeys = ingestInput(filename);

  // Read left and right sides of equation from "root" key
  const rootExpression = monkeys.root;
  if (!isBinaryOp(rootExpression)) throw new Error('Expected expression for root');
  let left = rootExpression.operand1;
  let right = rootExpression.operand2;
  delete monkeys.root;

  // Ignore "humn" key
  delete monkeys.humn;

  // Evaluate both sides of root. One side will simplify down to a number. The other side will
  // remain a BinaryOp.
  left = evaluate(left, monkeys);
  right = evaluate(right, monkeys);

  // Solve the equation
  let expr: Expr;
  let num: number;
  if (isNumber(left)) {
    num = left;
    expr = right;
  } else if (isNumber(right)) {
    num = right;
    expr = left;
  } else {
    throw new Error('Neither side is a number');
  }

  while (isBinaryOp(expr)) {
    if (!isNumber(expr.operand1) && isNumber(expr.operand2)) {
      num = getReverseOperatorFunction(expr.operator)(num, expr.operand2);
      expr = expr.operand1;
    } else if (isNumber(expr.operand1) && !isNumber(expr.operand2)) {
      if (expr.operator === '+') {
        num = num - expr.operand1;
      } else if (expr.operator === '-') {
        num = expr.operand1 - num;
      } else if (expr.operator === '*') {
        num = num / expr.operand1;
      } else if (expr.operator === '/') {
        num = expr.operand1 / num;
      }
      expr = expr.operand2;
    }
  }

  return num;
};

// Test
console.log(result('day21/test-input.txt'));
// 301

// Solution
console.log(result('day21/input.txt'));
// 3759569926192
