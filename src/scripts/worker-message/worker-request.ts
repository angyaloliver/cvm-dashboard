import { WorkerMessage } from "./worker-message";

export class WorkerRequest implements WorkerMessage {
  constructor(
    public type: "loadModel" | "getBoundingBoxes",
    public data: null | ImageData = null
  ) {}
}
