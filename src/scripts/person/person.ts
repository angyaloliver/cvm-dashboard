import { clamp } from "@tensorflow/tfjs-core/dist/util";
import { vec3 } from "gl-matrix";
import { BoundingBox } from "../bounding-box/bounding-box";
import { exponentialDecay } from "../helper/exponential-decay";

export class Person {
  public static readonly positionNoise = 1;
  public worldPosition = vec3.create();
  public cvm: number | null = null;

  constructor(public boundingBox: BoundingBox) {}

  public calculateCvm(people: Array<Person>): void {
    const neighbors = people.filter((p) => p !== this);
    let newCvm: number;
    if (neighbors.length > 0) {
      const distancesAscending = this.getDistanceFromNeighborsAscending(
        neighbors
      );

      if (distancesAscending[0] < 0.5) {
        newCvm = 0;
      } else {
        const sum = this.reduceDistances(distancesAscending);
        const res = Math.sqrt(distancesAscending[0] - 0.5) - 0.4 * sum;
        newCvm = clamp(0, res, 1);
      }
    } else {
      newCvm = 1;
    }

    if (this.cvm !== null) {
      this.cvm = exponentialDecay(this.cvm, newCvm, 32);
    } else {
      this.cvm = newCvm;
    }
  }

  private getDistanceFromNeighborsAscending(
    people: Array<Person>
  ): Array<number> {
    return people
      .map(
        (p) =>
          vec3.dist(this.worldPosition, p.worldPosition) /
          (1 + Person.positionNoise)
      )
      .sort((a, b) => a - b);
  }

  private reduceDistances(distances: Array<number>): number {
    return distances.reduce((p, c, i) => {
      if (i === 0) return 0; //!!
      return p + 1.5 - Math.sqrt(c - 0.5);
    }, 0);
  }
}
