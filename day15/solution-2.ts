import { readFileSync } from 'fs';

import _ from 'lodash';

interface Sensor {
  x: number;
  y: number;
  beaconX: number;
  beaconY: number;
}

interface Interval {
  low: number;
  high: number;
}

// Approach:
// 1. Ingest input into Sensor[]
// 2. For each (sensor, row), it's possible to calculate an interval where there can be no beacon.
//    Do this calculation to get a list of intervals.
// 3. Merge the intervals
// 4. Iterate over all possible rows and find the only possible position

class Solver {
  sensors: Sensor[];
  maxXOrY: number;

  constructor(filename: string, maxXOrY: number) {
    const inputRegex =
      /^Sensor at x=([0-9-]+), y=([0-9-]+): closest beacon is at x=([0-9-]+), y=([0-9-]+)$/;
    this.sensors = readFileSync(filename, 'utf8')
      .trimEnd()
      .split('\n')
      .map((line) => {
        const matches = inputRegex.exec(line);
        if (!matches) throw new Error('Invalid input');
        return {
          x: Number(matches[1]),
          y: Number(matches[2]),
          beaconX: Number(matches[3]),
          beaconY: Number(matches[4]),
        };
      });

    this.maxXOrY = maxXOrY;
  }

  /**
   * Calculate interval where there can be no beacon
   */
  noBeaconInterval(sensor: Sensor, row: number): Interval | null {
    const beaconDistance =
      Math.abs(sensor.x - sensor.beaconX) + Math.abs(sensor.y - sensor.beaconY);
    const rowDistance = Math.abs(sensor.y - row);

    console.log;
    if (rowDistance > beaconDistance) return null;

    return {
      low: Math.max(sensor.x - beaconDistance + rowDistance, 0),
      high: Math.min(sensor.x + beaconDistance - rowDistance, this.maxXOrY),
    };
  }

  static mergeIntervals(intervals: Interval[]): Interval[] {
    const sortedIntervals = _.sortBy(intervals, ['low', 'high']);

    const mergedIntervals: Interval[] = [];
    let holding: Interval = sortedIntervals[0];
    for (const current of sortedIntervals.slice(1)) {
      if (holding.high >= current.low - 1) {
        // If there's overlap, merge
        holding.high = Math.max(holding.high, current.high);
      } else {
        mergedIntervals.push(holding);
        holding = current;
      }
    }
    mergedIntervals.push(holding);

    return mergedIntervals;
  }

  result(): number {
    for (let y = 0; y <= this.maxXOrY; y++) {
      const intervals = this.sensors
        .map((sensor) => this.noBeaconInterval(sensor, y))
        .filter((interval): interval is Interval => Boolean(interval));
      const mergedIntervals = Solver.mergeIntervals(intervals);

      if (
        mergedIntervals.length === 1 &&
        mergedIntervals[0].low === 0 &&
        mergedIntervals[0].high === this.maxXOrY
      ) {
        continue;
      }

      let x: number;
      if (mergedIntervals.length === 1) {
        if (mergedIntervals[0].low !== 0) {
          x = 0;
        } else {
          x = this.maxXOrY;
        }
      } else {
        x = mergedIntervals[0].high + 1;
      }
      return x * 4000000 + y;
    }

    throw new Error('Could not find result');
  }
}

// Test
console.log(new Solver('day15/test-input.txt', 20).result());
// 56000011

// Solution
console.log(new Solver('day15/input.txt', 4000000).result());
// 12567351400528
