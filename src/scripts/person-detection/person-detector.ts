import { BoundingBox } from "../bounding-box/bounding-box";

export interface PersonDetector {
  loadModel(): Promise<void>;
  getBoundingBoxes(imageData: ImageData): Promise<BoundingBox[]>;
}
