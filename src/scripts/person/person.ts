import { vec3 } from 'gl-matrix';
import { BoundingBox } from '../bounding-box/bounding-box';

export class Person {
  boundingBox: BoundingBox;
  wPos: vec3;
  cvm: number;

  constructor(boundingBox: BoundingBox) {
    this.boundingBox = boundingBox;
    this.wPos = vec3.fromValues(0, 0, 0);
    this.cvm = 1;
  }

  public calculateCvm(people: Array<Person>): void {
    const neighbors = Array.from(people);
    const index = neighbors.indexOf(this);
    if (index > -1) {
      neighbors.splice(index, 1);
    }
    console.log(neighbors.length);
    if (neighbors.length > 0) {
      const distancesAscending = this.getDistanceFromNeighborsAscending(
        neighbors
      );
      // console.log('Distance from other people: ');
      // distancesAscending.forEach((d) => console.log(d));

      if (distancesAscending[0] < 0.5) {
        this.cvm = 0;
      } else {
        const sum = this.reduceDistances(distancesAscending);
        const res = Math.sqrt(distancesAscending[0] - 0.5) - 0.4 * sum;
        this.setCvmWithinRange(res);
      }
    } else {
      this.cvm = 1;
    }
  }

  private getDistanceFromNeighborsAscending(
    people: Array<Person>
  ): Array<number> {
    return people
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

  public moveLeft(): void {
    this.boundingBox.center.x -= 0.001;
  }

  public moveRight(): void {
    this.boundingBox.center.x += 0.001;
  }
}
