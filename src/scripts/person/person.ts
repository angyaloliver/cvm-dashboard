import { vec3 } from 'gl-matrix';
import { BoundingBox } from '../bounding-box/bounding-box';

export class Person {
  boundingBox: BoundingBox;
  wPos: vec3;
  cvm: number;
  neighbors: Array<Person>;

  constructor(boundingBox: BoundingBox, wPos: vec3) {
    this.boundingBox = boundingBox;
    this.wPos = wPos;
    this.neighbors = new Array<Person>();
    this.cvm = 1;
  }

  public addNeighbor(neighbor: Person): void {
    this.neighbors.push(neighbor);
  }

  public calculateCvm(): void {
    if (this.neighbors.length > 0) {
      const distancesAscending = this.getNeighborDistancesAscending();
      distancesAscending.forEach((d) => console.log(d));

      if (distancesAscending[0] < 0.5) {
        this.cvm = 0;
      } else {
        const sum = this.reduceDistances(distancesAscending);
        console.log('sum', sum);
        const res = Math.sqrt(distancesAscending[0] - 0.5) - 0.4 * sum;
        this.setCvmWithinRange(res);
        console.log('cvm', this.cvm);
      }
    } else {
      this.cvm = 1;
    }
  }

  private getNeighborDistancesAscending(): Array<number> {
    return this.neighbors
      .map((p) => vec3.dist(this.wPos, p.wPos))
      .sort((a, b) => a - b);
  }

  private reduceDistances(distances: Array<number>): number {
    return distances.reduce((accumulator, currentValue, currentIndex) => {
      if (currentIndex === 0) return 0; //!!
      return accumulator + 1.5 - Math.sqrt(currentValue - 0.5);
    }, 0);
  }

  private setCvmWithinRange(value: number) {
    this.cvm = Math.min(Math.max(value, 0), 1);
  }
}
