import { BoundingBox } from "../bounding-box/bounding-box";

// Store bounding boxes for finding out the perspective
export class BoundingBoxStorage {
  private nextIndex = 0;
  private bufferSize = 100;
  private storage: Array<BoundingBox> = [];

  public registerBoundingBox(bb: BoundingBox): void {
    this.storage[this.nextIndex] = bb;
    this.nextIndex = (this.nextIndex + 1) % this.bufferSize;
  }

  public get boxes(): ReadonlyArray<BoundingBox> {
    return this.storage;
  }
}
