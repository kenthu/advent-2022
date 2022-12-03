import { readFileSync } from 'fs';

type ChoiceCode = 'A' | 'B' | 'C';
const isChoiceCode = (input: string): input is ChoiceCode => {
  return ['A', 'B', 'C'].includes(input);
};

type OutcomeCode = 'X' | 'Y' | 'Z';
const isOutcomeCode = (input: string): input is OutcomeCode => {
  return ['X', 'Y', 'Z'].includes(input);
};

type StrategyGuide = [ChoiceCode, OutcomeCode][];

enum Choice {
  ROCK = 1,
  PAPER = 2,
  SCISSORS = 3,
}

const CHOICE_CODE_MAP: { [code in ChoiceCode]: Choice } = {
  A: Choice.ROCK,
  B: Choice.PAPER,
  C: Choice.SCISSORS,
};

enum Outcome {
  LOSE = 0,
  DRAW = 3,
  WIN = 6,
}

const OUTCOME_CODE_MAP: { [code in OutcomeCode]: number } = {
  X: Outcome.LOSE,
  Y: Outcome.DRAW,
  Z: Outcome.WIN,
};

const ingestInput = (filename: string): StrategyGuide => {
  return readFileSync(filename, 'utf8')
    .trim()
    .split('\n')
    .map((line) => {
      const [x, y] = line.split(' ');
      if (!isChoiceCode(x) || !isOutcomeCode(y)) {
        throw new Error(`Invalid line: ${x} ${y}`);
      }
      return [x, y];
    });
};

const winningChoice = (them: Choice): Choice => {
  if (them === Choice.ROCK) return Choice.PAPER;
  if (them === Choice.PAPER) return Choice.SCISSORS;
  return Choice.ROCK;
};

const losingChoice = (them: Choice): Choice => {
  if (them === Choice.ROCK) return Choice.SCISSORS;
  if (them === Choice.PAPER) return Choice.ROCK;
  return Choice.PAPER;
};

const roundScore = (opponentPlay: ChoiceCode, outcomeCode: OutcomeCode): number => {
  const opponentChoice = CHOICE_CODE_MAP[opponentPlay];
  const outcome = OUTCOME_CODE_MAP[outcomeCode];

  let myChoice;
  switch (outcome) {
    case Outcome.WIN:
      myChoice = winningChoice(opponentChoice);
      break;
    case Outcome.LOSE:
      myChoice = losingChoice(opponentChoice);
      break;
    default:
      myChoice = opponentChoice;
  }
  return myChoice + outcome;
};

const totalScore = (filename: string): number => {
  const strategyGuide = ingestInput(filename);
  return strategyGuide.reduce((acc, round) => acc + roundScore(...round), 0);
};

// Part 2 test
console.log(totalScore('day02/test-input.txt'));
// 12

// Part 2
console.log(totalScore('day02/input.txt'));
// 12683
