import { BoundingBox } from "../bounding-box/bounding-box";

// Store bounding boxes for finding out the perspective
export class BoundingBoxStorage {
  private storage: BoundingBox[] = [];
  private lastIdx = 0;
  private bufferSize = 1024;

  public registerBoundingBox(a: BoundingBox): void {
    if (this.storage.length < this.bufferSize) {
      this.storage.push(a);
    } else {
      // length is 1024, overwrite as a circular buffer
      // idea credited to Andrew
      this.storage[this.lastIdx] = a;
      this.lastIdx = (this.lastIdx + 1) % this.bufferSize;
    }
  }

  public getBoxes = (): BoundingBox[] => this.storage;
}
