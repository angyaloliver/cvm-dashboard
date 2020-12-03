import { BoundingBox } from "../bounding-box/bounding-box";
import { WorkerMessage } from "./worker-message";

export class WorkerResponse implements WorkerMessage {
  constructor(
    public type: "modelLoaded" | "boundingBoxes",
    public data: null | BoundingBox[]
  ) {}
}
