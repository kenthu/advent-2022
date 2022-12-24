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
// 4. Sum the positions in all remaining intervals

class Solver {
  sensors: Sensor[];

  constructor(filename: string) {
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
  }

  /**
   * Calculate interval where there can be no beacon
   */
  static noBeaconInterval(sensor: Sensor, row: number): Interval | null {
    const beaconDistance =
      Math.abs(sensor.x - sensor.beaconX) + Math.abs(sensor.y - sensor.beaconY);
    const rowDistance = Math.abs(sensor.y - row);

    console.log;
    if (rowDistance > beaconDistance) return null;

    return {
      low: sensor.x - beaconDistance + rowDistance,
      high: sensor.x + beaconDistance - rowDistance,
    };
  }

  static mergeIntervals(intervals: Interval[]): Interval[] {
    const sortedIntervals = _.sortBy(intervals, ['low', 'high']);

    const mergedIntervals: Interval[] = [];
    let holding: Interval = sortedIntervals[0];
    for (const current of sortedIntervals.slice(1)) {
      if (holding.high >= current.low) {
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

  result(row: number): number {
    const intervals = this.sensors
      .map((sensor) => Solver.noBeaconInterval(sensor, row))
      .filter((interval): interval is Interval => Boolean(interval));

    const mergedIntervals = Solver.mergeIntervals(intervals);

    // x-coordinates of all beacons on this row
    const beaconPositions = _.uniq(
      this.sensors.filter((sensor) => sensor.beaconY === row).map((sensor) => sensor.beaconX),
    );

    return _.sum(
      mergedIntervals.map((interval) => {
        const beaconsInInterval = beaconPositions.filter(
          (x) => interval.low <= x && x <= interval.high,
        );
        return interval.high - interval.low + 1 - beaconsInInterval.length;
      }),
    );
  }
}

// Test
console.log(new Solver('day15/test-input.txt').result(10));
// 26

// Solution
console.log(new Solver('day15/input.txt').result(2000000));
// 6078701
