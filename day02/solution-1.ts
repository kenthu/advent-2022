import { readFileSync } from 'fs';

const strategyGuideCodes = ['A', 'B', 'C', 'X', 'Y', 'Z'];
type StrategyGuideCode = 'A' | 'B' | 'C' | 'X' | 'Y' | 'Z';

const isStrategyGuideCode = (input: string): input is StrategyGuideCode => {
  return strategyGuideCodes.includes(input);
};

type StrategyGuide = [StrategyGuideCode, StrategyGuideCode][];

enum Choice {
  ROCK = 1,
  PAPER = 2,
  SCISSORS = 3,
}

const CODE_MAP: { [code in StrategyGuideCode]: Choice } = {
  A: Choice.ROCK,
  B: Choice.PAPER,
  C: Choice.SCISSORS,
  X: Choice.ROCK,
  Y: Choice.PAPER,
  Z: Choice.SCISSORS,
};

const ingestInput = (filename: string): StrategyGuide => {
  return readFileSync(filename, 'utf8')
    .trim()
    .split('\n')
    .map((line) => {
      const [x, y] = line.split(' ');
      if (!isStrategyGuideCode(x) || !isStrategyGuideCode(y)) {
        throw new Error(`Invalid line: ${x} ${y}`);
      }
      return [x, y];
    });
};

const roundScore = (opponentPlay: StrategyGuideCode, myPlay: StrategyGuideCode): number => {
  const them = CODE_MAP[opponentPlay];
  const me = CODE_MAP[myPlay];

  const shapeScore = me;
  let outcomeScore;
  if (me === them) {
    outcomeScore = 3;
  } else if (
    (me === Choice.ROCK && them === Choice.SCISSORS) ||
    (me === Choice.PAPER && them === Choice.ROCK) ||
    (me === Choice.SCISSORS && them === Choice.PAPER)
  ) {
    outcomeScore = 6;
  } else {
    outcomeScore = 0;
  }
  return shapeScore + outcomeScore;
};

const totalScore = (filename: string): number => {
  const strategyGuide = ingestInput(filename);
  return strategyGuide.reduce((acc, round) => acc + roundScore(...round), 0);
};

// Part 1 test
console.log(totalScore('day02/test-input.txt'));
// 15

// Part 1
console.log(totalScore('day02/input.txt'));
// 12458
